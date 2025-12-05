<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\{Get, GetCollection, Post, Patch, Delete};
use App\Repository\AccountRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity(repositoryClass: AccountRepository::class)]
#[ApiResource(
    operations: [
        new Get(security: "is_granted('ACCOUNT_VIEW', object)"),
        new GetCollection(security: "is_granted('ROLE_USER')"),
        new Post(
            securityPostDenormalize: "is_granted('ACCOUNT_CREATE', object)"
        ),
        new Patch(security: "is_granted('ACCOUNT_EDIT', object)"),
        new Delete(security: "is_granted('ACCOUNT_EDIT', object)")
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

    #[ORM\Column(type: 'datetime')]
    #[Groups(['account:read'])]
    private ?\DateTimeInterface $createdAt = null;

    /**
     * @var Collection<int, Movement>
     */
    #[ORM\OneToMany(targetEntity: Movement::class, mappedBy: 'account')]
    private Collection $movements;

    public function __construct()
    {
        $this->movements = new ArrayCollection();
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

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): static
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
}
