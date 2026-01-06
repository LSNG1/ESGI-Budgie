<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\{Get, GetCollection, Post, Patch, Delete};
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use App\Repository\MovementRepository;
use App\State\MovementCreateProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use DateTimeImmutable;

#[ORM\Entity(repositoryClass: MovementRepository::class)]
#[ApiFilter(SearchFilter::class, properties: [
    'account' => 'exact',
    'type' => 'exact',
    'name' => 'partial',
    'description' => 'partial'
])]
#[ApiResource(
    operations: [
        new Get(
            security: 'is_granted("ACCOUNT_VIEW", object.getAccount())'
        ),
        new GetCollection(
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            processor: MovementCreateProcessor::class,
            security: 'is_granted("ROLE_USER")'
        ),
        new Patch(
            security: 'is_granted("ACCOUNT_EDIT", object.getAccount())'
        ),
        new Delete(
            security: 'is_granted("ACCOUNT_EDIT", object.getAccount())'
        )
    ],
    normalizationContext: ['groups' => ['movement:read']],
    denormalizationContext: ['groups' => ['movement:write']]
)]
class Movement
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['movement:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'movements')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['movement:read','movement:write'])]
    private ?Account $account = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['movement:read'])]
    private ?User $user = null;

    #[ORM\Column(length: 150)]
    #[Groups(['movement:read','movement:write'])]
    private ?string $name = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['movement:read','movement:write'])]
    private ?string $description = null;

    #[ORM\Column(length: 20)]
    #[Groups(['movement:read','movement:write'])]
    private ?string $type = null; // 'income' / 'expense'

    #[ORM\Column(type: 'decimal', precision: 15, scale: 2)]
    #[Groups(['movement:read','movement:write'])]
    private ?string $amount = null;

    #[ORM\Column(length: 20)]
    #[Groups(['movement:read','movement:write'])]
    private ?string $frequencyType = null; // 'once' / 'every_n_months'

    #[ORM\Column(nullable: true)]
    #[Groups(['movement:read','movement:write'])]
    private ?int $frequencyN = null;

    #[ORM\Column(type: 'date_immutable')]
    #[Groups(['movement:read','movement:write'])]
    private ?DateTimeImmutable $startDate = null;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    #[Groups(['movement:read','movement:write'])]
    private ?DateTimeImmutable $endDate = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['movement:read'])]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['movement:read'])]
    private ?DateTimeImmutable $updatedAt = null;

    /**
     * @var Collection<int, MovementException>
     */
    #[ORM\OneToMany(targetEntity: MovementException::class, mappedBy: 'movement')]
    #[Groups(['movement:read'])]
    private Collection $exceptions;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
        $this->exceptions = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getAccount(): ?Account
    {
        return $this->account;
    }

    public function setAccount(?Account $account): static
    {
        $this->account = $account;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): static
    {
        $this->type = $type;

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

    public function getCreatedAt(): ?DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    /**
     * @return Collection<int, MovementException>
     */
    public function getExceptions(): Collection
    {
        return $this->exceptions;
    }

    public function addException(MovementException $exception): static
    {
        if (!$this->exceptions->contains($exception)) {
            $this->exceptions->add($exception);
            $exception->setMovement($this);
        }

        return $this;
    }

    public function removeException(MovementException $exception): static
    {
        if ($this->exceptions->removeElement($exception)) {
            // set the owning side to null (unless already changed)
            if ($exception->getMovement() === $this) {
                $exception->setMovement(null);
            }
        }

        return $this;
    }
}
