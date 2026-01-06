<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\AccountInviteRepository;
use App\State\AccountInviteAcceptProcessor;
use App\State\AccountInviteCreateProcessor;
use App\State\AccountInviteDeclineProcessor;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: AccountInviteRepository::class)]
#[ApiFilter(SearchFilter::class, properties: [
    'account' => 'exact',
    'email' => 'partial',
    'status' => 'exact',
])]
#[ApiResource(
    operations: [
        new Get(
            security: 'is_granted("ROLE_USER") and (object.getEmail() == user.getUserIdentifier() or is_granted("ACCOUNT_VIEW", object.getAccount()))'
        ),
        new GetCollection(
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            processor: AccountInviteCreateProcessor::class,
            securityPostDenormalize: 'is_granted("ACCOUNT_EDIT", object.getAccount())'
        ),
        new Post(
            uriTemplate: '/account_invites/{id}/accept',
            processor: AccountInviteAcceptProcessor::class,
            read: true,
            input: false,
            security: 'is_granted("ROLE_USER")'
        ),
        new Post(
            uriTemplate: '/account_invites/{id}/decline',
            processor: AccountInviteDeclineProcessor::class,
            read: true,
            input: false,
            security: 'is_granted("ROLE_USER")'
        ),
        new Delete(
            security: 'is_granted("ACCOUNT_EDIT", object.getAccount())'
        )
    ],
    normalizationContext: ['groups' => ['invite:read']],
    denormalizationContext: ['groups' => ['invite:write']]
)]
class AccountInvite
{
    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_DECLINED = 'declined';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['invite:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['invite:read', 'invite:write'])]
    private ?Account $account = null;

    #[ORM\Column(length: 180)]
    #[Groups(['invite:read', 'invite:write'])]
    private ?string $email = null;

    #[ORM\Column(length: 64, unique: true)]
    #[Groups(['invite:read'])]
    private ?string $token = null;

    #[ORM\Column(length: 20)]
    #[Groups(['invite:read'])]
    private ?string $role = null;

    #[ORM\Column(length: 20)]
    #[Groups(['invite:read'])]
    private ?string $status = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['invite:read'])]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    #[Groups(['invite:read', 'invite:write'])]
    private ?DateTimeImmutable $expiresAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['invite:read'])]
    private ?DateTimeImmutable $acceptedAt = null;

    #[ORM\ManyToOne]
    #[Groups(['invite:read'])]
    private ?User $acceptedBy = null;

    public function __construct()
    {
        $this->createdAt = new DateTimeImmutable();
        $this->status = self::STATUS_PENDING;
        $this->role = 'viewer';
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

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

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

    public function getExpiresAt(): ?DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(?DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function getAcceptedAt(): ?DateTimeImmutable
    {
        return $this->acceptedAt;
    }

    public function setAcceptedAt(?DateTimeImmutable $acceptedAt): static
    {
        $this->acceptedAt = $acceptedAt;

        return $this;
    }

    public function getAcceptedBy(): ?User
    {
        return $this->acceptedBy;
    }

    public function setAcceptedBy(?User $acceptedBy): static
    {
        $this->acceptedBy = $acceptedBy;

        return $this;
    }
}
