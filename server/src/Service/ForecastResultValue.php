<?php

namespace App\Service;

class ForecastResultValue
{
    public function __construct(
        private float $balance,
        private array $monthly
    ) {
    }

    public function getBalance(): float
    {
        return $this->balance;
    }

    public function getMonthly(): array
    {
        return $this->monthly;
    }
}
