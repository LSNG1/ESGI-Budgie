<?php

namespace App\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Account;
use App\Entity\Movement;
use App\Entity\MovementException;
use App\Entity\User;
use App\Entity\UserAccount;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;

class CurrentUserExtension implements QueryCollectionExtensionInterface
{
    public function __construct(private Security $security)
    {
    }

    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];

        if ($resourceClass === UserAccount::class) {
            $queryBuilder
                ->andWhere(sprintf('%s.user = :current_user', $rootAlias))
                ->setParameter('current_user', $user);

            return;
        }

        if ($resourceClass === Account::class) {
            $userAccountAlias = $queryNameGenerator->generateJoinAlias('userAccount');
            $queryBuilder
                ->join(sprintf('%s.userAccounts', $rootAlias), $userAccountAlias)
                ->andWhere(sprintf('%s.user = :current_user', $userAccountAlias))
                ->setParameter('current_user', $user);

            return;
        }

        if ($resourceClass === Movement::class) {
            $accountAlias = $queryNameGenerator->generateJoinAlias('account');
            $userAccountAlias = $queryNameGenerator->generateJoinAlias('userAccount');
            $queryBuilder
                ->join(sprintf('%s.account', $rootAlias), $accountAlias)
                ->join(sprintf('%s.userAccounts', $accountAlias), $userAccountAlias)
                ->andWhere(sprintf('%s.user = :current_user', $userAccountAlias))
                ->setParameter('current_user', $user);

            return;
        }

        if ($resourceClass === MovementException::class) {
            $movementAlias = $queryNameGenerator->generateJoinAlias('movement');
            $accountAlias = $queryNameGenerator->generateJoinAlias('account');
            $userAccountAlias = $queryNameGenerator->generateJoinAlias('userAccount');
            $queryBuilder
                ->join(sprintf('%s.movement', $rootAlias), $movementAlias)
                ->join(sprintf('%s.account', $movementAlias), $accountAlias)
                ->join(sprintf('%s.userAccounts', $accountAlias), $userAccountAlias)
                ->andWhere(sprintf('%s.user = :current_user', $userAccountAlias))
                ->setParameter('current_user', $user);
        }
    }
}
