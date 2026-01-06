<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\GlobalForecastProvider;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/forecast',
            provider: GlobalForecastProvider::class,
            security: 'is_granted("ROLE_USER")'
        )
    ],
    normalizationContext: ['groups' => ['forecast_global:read']]
)]
class GlobalForecastResult
{
    #[Groups(['forecast_global:read'])]
    public string $targetDate;

    #[Groups(['forecast_global:read'])]
    public float $totalBalance;

    /**
     * @var AccountBalanceItem[]
     */
    #[Groups(['forecast_global:read'])]
    public array $accounts = [];
}
