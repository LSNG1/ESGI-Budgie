<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\ForecastResult;
use App\Entity\Account;
use App\Service\ForecastCalculator;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class ForecastProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private ForecastCalculator $calculator,
        private RequestStack $requestStack,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $accountId = (int)($uriVariables['id'] ?? 0);
        $account = $this->em->getRepository(Account::class)->find($accountId);

        if (!$account) {
            return null;
        }

        $request = $this->requestStack->getCurrentRequest();
        $targetDateParam = $request?->query->get('targetDate', date('Y-m-d'));
        $targetDate = new DateTimeImmutable($targetDateParam);

        $calc = $this->calculator->forecastAccount($account, $targetDate);

        $dto = new ForecastResult();
        $dto->accountId = $accountId;
        $dto->targetDate = $targetDate->format('Y-m-d');
        $dto->balance = $calc->getBalance();
        $dto->monthlyBreakdown = $calc->getMonthly();

        return $dto;
    }
}
