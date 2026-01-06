<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Repository\SubscriptionRepository;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserPasswordHasherProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private UserPasswordHasherInterface $passwordHasher,
        private RequestStack $requestStack,
        private SubscriptionRepository $subscriptionRepository
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof User) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        $previousData = $context['previous_data'] ?? null;
        $passwordChanged = $previousData instanceof User
            ? $data->getPassword() !== $previousData->getPassword()
            : $data->getPassword() !== null;

        if ($passwordChanged) {
            $request = $this->requestStack->getCurrentRequest();
            $payload = $request ? json_decode($request->getContent() ?: '{}', true) : [];
            $oldPassword = is_array($payload) ? ($payload['oldPassword'] ?? null) : null;

            if ($previousData instanceof User) {
                if (!$oldPassword) {
                    throw new BadRequestHttpException('Old password is required.');
                }
                if (!$this->passwordHasher->isPasswordValid($previousData, $oldPassword)) {
                    throw new BadRequestHttpException('Old password is invalid.');
                }
            }

            $data->setPassword($this->passwordHasher->hashPassword($data, (string) $data->getPassword()));
        }

        if (!$previousData instanceof User && $data->isVerified() === null) {
            $data->setVerified(false);
        }

        if (!$previousData instanceof User && $data->getSubscription() === null) {
            $defaultSubscription = $this->subscriptionRepository->findOneBy(['name' => 'Gratuit'])
                ?? $this->subscriptionRepository->findOneBy([], ['id' => 'ASC']);
            if ($defaultSubscription) {
                $data->setSubscription($defaultSubscription);
            }
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
