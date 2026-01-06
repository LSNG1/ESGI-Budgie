<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Post;
use App\State\LoginProcessor;
use \Symfony\Component\Serializer\Attribute\Groups;
#[ApiResource(
    operations: [
        new Post(
            uriTemplate: '/login',
            input: LoginRequest::class,
            processor: LoginProcessor::class,
            read: false,
            status: 200
        )
    ],
    normalizationContext: ['groups' => ['login:read']],
    denormalizationContext: ['groups' => ['login:write']]
)]
class LoginResponse
{
    #[Groups(['login:read'])]
    public ?int $id = null;

    #[Groups(['login:read'])]
    public ?string $email = null;

    #[Groups(['login:read'])]
    public ?string $firstname = null;

    #[Groups(['login:read'])]
    public ?string $lastname = null;

    /**
     * @var list<string>
     */
    #[Groups(['login:read'])]
    public array $roles = [];
}
