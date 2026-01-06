<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\AccountInvite;
use App\Entity\User;
use App\Entity\UserAccount;
use App\Repository\UserAccountRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class AccountInviteAcceptProcessor implements ProcessorInterface
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
        if (!$data instanceof AccountInvite) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentication required.');
        }

        if (strtolower($data->getEmail()) !== strtolower($user->getUserIdentifier())) {
            throw new AccessDeniedException('This invite does not belong to you.');
        }

        if ($data->getStatus() !== AccountInvite::STATUS_PENDING) {
            throw new BadRequestHttpException('Invite is no longer pending.');
        }

        $expiresAt = $data->getExpiresAt();
        if ($expiresAt && $expiresAt < new \DateTimeImmutable('today')) {
            throw new BadRequestHttpException('Invite has expired.');
        }

        $existing = $this->userAccountRepository->findOneBy([
            'user' => $user,
            'account' => $data->getAccount(),
        ]);

        if (!$existing) {
            $userAccount = (new UserAccount())
                ->setUser($user)
                ->setAccount($data->getAccount())
                ->setRole($data->getRole() ?: 'viewer');

            $this->em->persist($userAccount);
        }

        $data->setStatus(AccountInvite::STATUS_ACCEPTED);
        $data->setAcceptedAt(new \DateTimeImmutable());
        $data->setAcceptedBy($user);

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
