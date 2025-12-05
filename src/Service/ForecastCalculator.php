<?php

namespace App\Service;

use App\Entity\Account;
use App\Entity\Movement;
use App\Entity\MovementException;
use DateInterval;
use DatePeriod;
use DateTimeImmutable;

class ForecastCalculator
{
    public function forecastAccount(Account $account, DateTimeImmutable $targetDate): ForecastResultValue
    {
        $balance = 0.0;

        $startMonth = new DateTimeImmutable($account->getCreatedAt()->format('Y-m-01'));
        $endMonth = new DateTimeImmutable($targetDate->format('Y-m-01'));
        $period = new DatePeriod($startMonth, new DateInterval('P1M'), $endMonth->add(new DateInterval('P1M')));

        $monthly = [];
        $movements = $account->getMovements();

        foreach ($period as $month) {
            $monthKey = $month->format('Y-m');

            $incomes = 0.0;
            $expenses = 0.0;

            foreach ($movements as $movement) {
                $amount = $this->effectiveAmountForMonth($movement, $month);
                if ($amount === null) {
                    continue;
                }

                if ($movement->getType() === 'income') {
                    $incomes += $amount;
                } elseif ($movement->getType() === 'expense') {
                    $expenses += $amount;
                }
            }

            $rateMonthly = (float)$account->getRateOfPay() / 12;
            $interestGross = $balance * $rateMonthly;
            $tax = $interestGross * (float)$account->getTaxRate();
            $interestNet = $interestGross - $tax;

            $balance = $balance + $incomes - $expenses + $interestNet;

            $monthly[$monthKey] = [
                'incomes' => $incomes,
                'expenses' => $expenses,
                'interestNet' => $interestNet,
                'balance' => $balance,
            ];
        }

        return new ForecastResultValue($balance, $monthly);
    }

    private function effectiveAmountForMonth(Movement $movement, DateTimeImmutable $month): ?float
    {
        if (!$this->isApplicableForMonth(
            $movement->getStartDate(),
            $movement->getEndDate(),
            $movement->getFrequencyType(),
            $movement->getFrequencyN(),
            $month
        )) {
            return null;
        }

        $exception = $this->findExceptionFor($movement, $month);
        if ($exception instanceof MovementException) {
            return (float)$exception->getAmount();
        }

        return (float)$movement->getAmount();
    }

    private function isApplicableForMonth(
        \DateTimeInterface $startDate,
        ?\DateTimeInterface $endDate,
        string $frequencyType,
        ?int $frequencyN,
        DateTimeImmutable $month
    ): bool {
        $start = new DateTimeImmutable($startDate->format('Y-m-01'));
        $end = $endDate ? new DateTimeImmutable($endDate->format('Y-m-01')) : null;
        $current = new DateTimeImmutable($month->format('Y-m-01'));

        if ($current < $start) {
            return false;
        }

        if ($end && $current > $end) {
            return false;
        }

        if ($frequencyType === 'once') {
            return $current == $start;
        }

        if ($frequencyType === 'every_n_months' && $frequencyN !== null) {
            $diffObj = $start->diff($current);
            $diff = $diffObj->m + 12 * $diffObj->y;
            return $diff % $frequencyN === 0;
        }

        return false;
    }

    private function findExceptionFor(Movement $movement, DateTimeImmutable $month): ?MovementException
    {
        foreach ($movement->getExceptions() as $exception) {
            if ($this->isApplicableForMonth(
                $exception->getStartDate(),
                $exception->getEndDate(),
                $exception->getFrequencyType(),
                $exception->getFrequencyN(),
                $month
            )) {
                return $exception;
            }
        }

        return null;
    }
}
