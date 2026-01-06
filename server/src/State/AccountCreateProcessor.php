<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Account;
use App\Entity\User;
use App\Entity\UserAccount;
use App\Repository\UserAccountRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class AccountCreateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private EntityManagerInterface $em,
        private Security $security,
        private UserAccountRepository $userAccountRepository
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Account) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentication required.');
        }

        $subscription = $user->getSubscription();
        if ($subscription && $subscription->getMaxAccounts() !== null) {
            $ownedCount = $this->userAccountRepository->count([
                'user' => $user,
                'role' => 'owner',
            ]);
            if ($ownedCount >= $subscription->getMaxAccounts()) {
                throw new BadRequestHttpException('Account limit reached for your subscription.');
            }
        }

        if ($data->getCreatedAt() === null) {
            $data->setCreatedAt(new \DateTimeImmutable());
        }

        $userAccount = new UserAccount();
        $userAccount->setUser($user);
        $userAccount->setAccount($data);
        $userAccount->setRole('owner');

        $this->em->persist($userAccount);

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
