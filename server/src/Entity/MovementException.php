<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\{Get, GetCollection, Post, Patch, Delete};
use App\Repository\MovementExceptionRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;
use DateTimeImmutable;

#[ORM\Entity(repositoryClass: MovementExceptionRepository::class)]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(),
        new Patch(),
        new Delete()
    ],
    normalizationContext: ['groups' => ['exception:read']],
    denormalizationContext: ['groups' => ['exception:write']]
)]
class MovementException
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['exception:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'exceptions')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['exception:read','exception:write'])]
    private ?Movement $movement = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['exception:read','exception:write'])]
    private ?string $description = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    #[Groups(['exception:read','exception:write'])]
    private ?string $amount = null;

    #[ORM\Column(type: 'date_immutable')]
    #[Groups(['exception:read','exception:write'])]
    private ?DateTimeImmutable $startDate = null;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    #[Groups(['exception:read','exception:write'])]
    private ?DateTimeImmutable $endDate = null;

    #[ORM\Column(length: 20)]
    #[Groups(['exception:read','exception:write'])]
    private ?string $frequencyType = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['exception:read','exception:write'])]
    private ?int $frequencyN = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['exception:read'])]
    private ?DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMovement(): ?Movement
    {
        return $this->movement;
    }

    public function setMovement(?Movement $movement): static
    {
        $this->movement = $movement;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getAmount(): ?string
    {
        return $this->amount;
    }

    public function setAmount(string $amount): static
    {
        $this->amount = $amount;

        return $this;
    }

    public function getStartDate(): ?DateTimeImmutable
    {
        return $this->startDate;
    }

    public function setStartDate(DateTimeImmutable $startDate): static
    {
        $this->startDate = $startDate;

        return $this;
    }

    public function getEndDate(): ?DateTimeImmutable
    {
        return $this->endDate;
    }

    public function setEndDate(?DateTimeImmutable $endDate): static
    {
        $this->endDate = $endDate;

        return $this;
    }

    public function getFrequencyType(): ?string
    {
        return $this->frequencyType;
    }

    public function setFrequencyType(string $frequencyType): static
    {
        $this->frequencyType = $frequencyType;

        return $this;
    }

    public function getFrequencyN(): ?int
    {
        return $this->frequencyN;
    }

    public function setFrequencyN(?int $frequencyN): static
    {
        $this->frequencyN = $frequencyN;

        return $this;
    }

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }
}
