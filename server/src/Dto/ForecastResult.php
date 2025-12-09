<?php

namespace App\Dto;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use App\State\ForecastProvider;
use Symfony\Component\Serializer\Annotation\Groups;

#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/accounts/{id}/forecast',
            provider: ForecastProvider::class
        )
    ],
    normalizationContext: ['groups' => ['forecast:read']]
)]
class ForecastResult
{
    #[Groups(['forecast:read'])]
    public int $accountId;

    #[Groups(['forecast:read'])]
    public string $targetDate;

    #[Groups(['forecast:read'])]
    public float $balance;

    #[Groups(['forecast:read'])]
    public array $monthlyBreakdown = [];
}
