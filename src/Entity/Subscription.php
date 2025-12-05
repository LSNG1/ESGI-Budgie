<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\SubscriptionRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SubscriptionRepository::class)]
#[ApiResource]
class Subscription
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $name = null;

    #[ORM\Column(nullable: true)]
    private ?int $maxAccounts = null;

    #[ORM\Column(nullable: true)]
    private ?int $maxIncomes = null;

    #[ORM\Column(nullable: true)]
    private ?int $maxExpenses = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getMaxAccounts(): ?int
    {
        return $this->maxAccounts;
    }

    public function setMaxAccounts(?int $maxAccounts): static
    {
        $this->maxAccounts = $maxAccounts;

        return $this;
    }

    public function getMaxIncomes(): ?int
    {
        return $this->maxIncomes;
    }

    public function setMaxIncomes(?int $maxIncomes): static
    {
        $this->maxIncomes = $maxIncomes;

        return $this;
    }

    public function getMaxExpenses(): ?int
    {
        return $this->maxExpenses;
    }

    public function setMaxExpenses(?int $maxExpenses): static
    {
        $this->maxExpenses = $maxExpenses;

        return $this;
    }
}
