<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\AccountInvite;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

class AccountInviteCreateProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof AccountInvite) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        if (!$data->getEmail()) {
            throw new BadRequestHttpException('Invite email is required.');
        }

        if ($data->getToken() === null) {
            $data->setToken(bin2hex(random_bytes(16)));
        }

        $data->setRole('viewer');

        if ($data->getStatus() === null) {
            $data->setStatus(AccountInvite::STATUS_PENDING);
        }

        if ($data->getCreatedAt() === null) {
            $data->setCreatedAt(new \DateTimeImmutable());
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
