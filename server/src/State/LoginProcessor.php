<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\LoginResponse;
use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

class LoginProcessor implements ProcessorInterface
{
    public function __construct(private Security $security)
    {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): LoginResponse
    {
        $user = $this->security->getUser();
        if (!$user instanceof User) {
            throw new AccessDeniedException('Authentication required.');
        }

        $response = new LoginResponse();
        $response->id = $user->getId();
        $response->email = $user->getEmail();
        $response->firstname = $user->getFirstname();
        $response->lastname = $user->getLastname();
        $response->roles = $user->getRoles();

        return $response;
    }
}
