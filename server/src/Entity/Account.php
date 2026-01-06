<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\{Get, GetCollection, Post, Patch, Delete};
use App\Entity\UserAccount;
use App\Repository\AccountRepository;
use App\State\AccountCreateProcessor;
use App\State\AccountDeleteProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use DateTimeImmutable;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: AccountRepository::class)]
#[ApiResource(
    operations: [
        new Get(
            security: 'is_granted("ACCOUNT_VIEW", object)'
        ),
        new GetCollection(
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            processor: AccountCreateProcessor::class,
            security: 'is_granted("ROLE_USER")'
        ),
        new Patch(
            security: 'is_granted("ACCOUNT_EDIT", object)'
        ),
        new Delete(
            processor: AccountDeleteProcessor::class,
            security: 'is_granted("ACCOUNT_EDIT", object)'
        )
    ],
    normalizationContext: ['groups' => ['account:read']],
    denormalizationContext: ['groups' => ['account:write']]
)]
class Account
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['account:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['account:read','account:write'])]
    private ?string $name = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['account:read','account:write'])]
    private ?string $type = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['account:read','account:write'])]
    private ?string $description = null;

    #[ORM\Column(type: 'decimal', precision: 5, scale: 4)]
    #[Groups(['account:read','account:write'])]
    private ?string $taxRate = null;

    #[ORM\Column(type: 'decimal', precision: 6, scale: 4)]
    #[Groups(['account:read','account:write'])]
    private ?string $rateOfPay = null;

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2, nullable: true)]
    #[Groups(['account:read','account:write'])]
    private ?string $overdraft = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['account:read','account:write'])]
    private ?DateTimeImmutable $createdAt = null;

    /**
     * @var Collection<int, Movement>
     */
    #[ORM\OneToMany(targetEntity: Movement::class, mappedBy: 'account')]
    private Collection $movements;

    /**
     * @var Collection<int, UserAccount>
     */
    #[ORM\OneToMany(targetEntity: UserAccount::class, mappedBy: 'account', orphanRemoval: true)]
    private Collection $userAccounts;

    public function __construct()
    {
        $this->movements = new ArrayCollection();
        $this->userAccounts = new ArrayCollection();
        $this->createdAt = new DateTimeImmutable();
    }

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

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(?string $type): static
    {
        $this->type = $type;

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

    public function getTaxRate(): ?string
    {
        return $this->taxRate;
    }

    public function setTaxRate(string $taxRate): static
    {
        $this->taxRate = $taxRate;

        return $this;
    }

    public function getRateOfPay(): ?string
    {
        return $this->rateOfPay;
    }

    public function setRateOfPay(string $rateOfPay): static
    {
        $this->rateOfPay = $rateOfPay;

        return $this;
    }

    public function getOverdraft(): ?string
    {
        return $this->overdraft;
    }

    public function setOverdraft(string $overdraft): static
    {
        $this->overdraft = $overdraft;

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

    /**
     * @return Collection<int, Movement>
     */
    public function getMovements(): Collection
    {
        return $this->movements;
    }

    public function addMovement(Movement $movement): static
    {
        if (!$this->movements->contains($movement)) {
            $this->movements->add($movement);
            $movement->setAccount($this);
        }

        return $this;
    }

    public function removeMovement(Movement $movement): static
    {
        if ($this->movements->removeElement($movement)) {
            // set the owning side to null (unless already changed)
            if ($movement->getAccount() === $this) {
                $movement->setAccount(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, UserAccount>
     */
    public function getUserAccounts(): Collection
    {
        return $this->userAccounts;
    }

    public function addUserAccount(UserAccount $userAccount): static
    {
        if (!$this->userAccounts->contains($userAccount)) {
            $this->userAccounts->add($userAccount);
            $userAccount->setAccount($this);
        }

        return $this;
    }

    public function removeUserAccount(UserAccount $userAccount): static
    {
        if ($this->userAccounts->removeElement($userAccount)) {
            if ($userAccount->getAccount() === $this) {
                $userAccount->setAccount(null);
            }
        }

        return $this;
    }
}
