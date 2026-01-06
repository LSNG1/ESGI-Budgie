<?php

namespace App\Dto;

use Symfony\Component\Serializer\Attribute\Groups;

class AccountBalanceItem
{
    #[Groups(['forecast_global:read'])]
    public int $id;

    #[Groups(['forecast_global:read'])]
    public string $name;

    #[Groups(['forecast_global:read'])]
    public ?string $type = null;

    #[Groups(['forecast_global:read'])]
    public float $balance;
}
