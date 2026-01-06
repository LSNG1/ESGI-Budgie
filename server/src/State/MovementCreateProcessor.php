<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Movement;
use App\Entity\User;
use App\Repository\UserAccountRepository;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class MovementCreateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private Security $security,
        private UserAccountRepository $userAccountRepository
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Movement) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentication required.');
        }

        $account = $data->getAccount();
        if ($account === null) {
            throw new BadRequestHttpException('Account is required.');
        }

        $userAccount = $this->userAccountRepository->findOneBy([
            'user' => $user,
            'account' => $account,
        ]);

        if (!$userAccount || $userAccount->getRole() !== 'owner') {
            throw new AccessDeniedException('You cannot add movements to this account.');
        }

        $data->setUser($user);

        if ($data->getFrequencyType() === 'every_n_months' && (!$data->getFrequencyN() || $data->getFrequencyN() < 1)) {
            $data->setFrequencyN(1);
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
