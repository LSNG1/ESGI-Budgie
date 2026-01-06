<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProviderInterface;
use App\Dto\AccountBalanceItem;
use App\Dto\GlobalForecastResult;
use App\Entity\Account;
use App\Entity\User;
use App\Service\ForecastCalculator;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class GlobalForecastProvider implements ProviderInterface
{
    public function __construct(
        private EntityManagerInterface $em,
        private ForecastCalculator $calculator,
        private RequestStack $requestStack,
        private Security $security,
    ) {
    }

    public function provide(Operation $operation, array $uriVariables = [], array $context = []): object|array|null
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentication required.');
        }

        $request = $this->requestStack->getCurrentRequest();
        $targetDateParam = $request?->query->get('targetDate', date('Y-m-d'));
        $targetDate = new DateTimeImmutable($targetDateParam);

        $qb = $this->em->getRepository(Account::class)->createQueryBuilder('a');
        $qb
            ->join('a.userAccounts', 'ua')
            ->andWhere('ua.user = :user')
            ->setParameter('user', $user)
            ->leftJoin('a.movements', 'm')
            ->addSelect('m')
            ->leftJoin('m.exceptions', 'me')
            ->addSelect('me')
            ->orderBy('a.name', 'ASC');

        $accounts = $qb->getQuery()->getResult();

        $result = new GlobalForecastResult();
        $result->targetDate = $targetDate->format('Y-m-d');

        $totalBalance = 0.0;
        $items = [];

        foreach ($accounts as $account) {
            if (!$account instanceof Account) {
                continue;
            }

            $calc = $this->calculator->forecastAccount($account, $targetDate);
            $item = new AccountBalanceItem();
            $item->id = $account->getId();
            $item->name = $account->getName() ?? '';
            $item->type = $account->getType();
            $item->balance = $calc->getBalance();

            $items[] = $item;
            $totalBalance += $item->balance;
        }

        $result->accounts = $items;
        $result->totalBalance = $totalBalance;

        return $result;
    }
}
