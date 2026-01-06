<?php

namespace App\Dto;

use Symfony\Component\Serializer\Attribute\Groups;

class LoginRequest
{
    #[Groups(['login:write'])]
    public ?string $email = null;

    #[Groups(['login:write'])]
    public ?string $password = null;
}
