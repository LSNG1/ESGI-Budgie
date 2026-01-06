export const parseIriId = (value) => {
  if (!value) return null;
  if (typeof value === "object") {
    if (value.id) return value.id;
    if (value["@id"]) {
      const match = value["@id"].match(/\/(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    }
  }
  if (typeof value !== "string") return null;
  const match = value.match(/\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
};

const toMonthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const monthsDiff = (start, end) =>
  (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

export const isApplicableForMonth = (
  startDate,
  endDate,
  frequencyType,
  frequencyN,
  targetDate
) => {
  if (!startDate) return false;
  const start = toMonthStart(new Date(startDate));
  const current = toMonthStart(new Date(targetDate));
  if (Number.isNaN(start.getTime()) || Number.isNaN(current.getTime())) {
    return false;
  }

  if (current < start) return false;

  if (endDate) {
    const end = toMonthStart(new Date(endDate));
    if (!Number.isNaN(end.getTime()) && current > end) return false;
  }

  if (frequencyType === "once") {
    return current.getTime() === start.getTime();
  }

  if (frequencyType === "every_n_months") {
    const diff = monthsDiff(start, current);
    const n = frequencyN || 1;
    return diff % n === 0;
  }

  return false;
};

export const resolveExceptionAmount = (exceptions, targetDate) => {
  if (!Array.isArray(exceptions)) return null;
  for (const exception of exceptions) {
    if (
      isApplicableForMonth(
        exception.startDate,
        exception.endDate,
        exception.frequencyType,
        exception.frequencyN,
        targetDate
      )
    ) {
      const parsed = parseFloat(exception.amount);
      return Number.isFinite(parsed) ? parsed : null;
    }
  }
  return null;
};

export const generateOccurrences = (movement, exceptions = [], untilDate = new Date()) => {
  const occurrences = [];
  if (!movement?.startDate) return occurrences;

  const startDate = new Date(movement.startDate);
  if (Number.isNaN(startDate.getTime())) return occurrences;

  const endDate = movement.endDate ? new Date(movement.endDate) : null;
  const end = endDate && !Number.isNaN(endDate.getTime()) ? endDate : null;
  const frequencyN = movement.frequencyN || 1;
  const baseAmount = parseFloat(movement.amount);

  if (movement.frequencyType === "once") {
    if (startDate <= untilDate && (!end || startDate <= end)) {
      const exceptionAmount = resolveExceptionAmount(exceptions, startDate);
      const amount = Number.isFinite(exceptionAmount) ? exceptionAmount : baseAmount;
      occurrences.push({
        id: `${movement.id}-0`,
        name: movement.name,
        description: movement.description,
        type: movement.type,
        amount,
        date: movement.startDate,
        isRecurring: false,
      });
    }
    return occurrences;
  }

  if (movement.frequencyType === "every_n_months") {
    let currentDate = new Date(startDate);
    let occurrenceIndex = 0;

    while (currentDate <= untilDate) {
      if (end && currentDate > end) break;

      const exceptionAmount = resolveExceptionAmount(exceptions, currentDate);
      const amount = Number.isFinite(exceptionAmount) ? exceptionAmount : baseAmount;

      occurrences.push({
        id: `${movement.id}-${occurrenceIndex}`,
        name: movement.name,
        description: movement.description,
        type: movement.type,
        amount,
        date: currentDate.toISOString().split("T")[0],
        isRecurring: true,
      });

      currentDate = new Date(currentDate);
      currentDate.setMonth(currentDate.getMonth() + frequencyN);
      occurrenceIndex += 1;
    }
  }

  return occurrences;
};
