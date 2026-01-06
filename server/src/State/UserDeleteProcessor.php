<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Movement;
use App\Entity\User;
use App\Entity\UserAccount;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class UserDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.remove_processor')]
        private ProcessorInterface $removeProcessor,
        private EntityManagerInterface $em
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof User) {
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        $userAccounts = $this->em->getRepository(UserAccount::class)->findBy(['user' => $data]);
        foreach ($userAccounts as $userAccount) {
            $account = $userAccount->getAccount();
            if ($userAccount->getRole() === 'owner') {
                $movements = $this->em->getRepository(Movement::class)->findBy(['account' => $account]);
                foreach ($movements as $movement) {
                    foreach ($movement->getExceptions() as $exception) {
                        $this->em->remove($exception);
                    }
                    $this->em->remove($movement);
                }
                $this->em->remove($account);
            }

            $this->em->remove($userAccount);
        }

        return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
    }
}
