<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Account;
use App\Entity\Movement;
use App\Entity\UserAccount;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

class AccountDeleteProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.remove_processor')]
        private ProcessorInterface $removeProcessor,
        private EntityManagerInterface $em
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof Account) {
            return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
        }

        $movements = $this->em->getRepository(Movement::class)->findBy(['account' => $data]);
        foreach ($movements as $movement) {
            foreach ($movement->getExceptions() as $exception) {
                $this->em->remove($exception);
            }
            $this->em->remove($movement);
        }

        $userAccounts = $this->em->getRepository(UserAccount::class)->findBy(['account' => $data]);
        foreach ($userAccounts as $userAccount) {
            $this->em->remove($userAccount);
        }

        return $this->removeProcessor->process($data, $operation, $uriVariables, $context);
    }
}
