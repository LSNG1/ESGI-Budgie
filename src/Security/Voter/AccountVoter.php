<?php

namespace App\Security\Voter;

use App\Entity\Account;
use App\Entity\User;
use App\Entity\UserAccount;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class AccountVoter extends Voter
{
    public const VIEW = 'ACCOUNT_VIEW';
    public const EDIT = 'ACCOUNT_EDIT';
    public const CREATE = 'ACCOUNT_CREATE';

    public function __construct(
        private EntityManagerInterface $em
    ) {
    }

    protected function supports(string $attribute, $subject): bool
    {
        if ($attribute === self::CREATE) {
            return true;
        }

        return $subject instanceof Account && in_array($attribute, [self::VIEW, self::EDIT], true);
    }

    protected function voteOnAttribute(string $attribute, $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        if ($attribute === self::CREATE) {
            return true;
        }

        if (!$subject instanceof Account) {
            return false;
        }

        $ua = $this->em->getRepository(UserAccount::class)->findOneBy([
            'user' => $user,
            'account' => $subject,
        ]);

        if (!$ua) {
            return false;
        }

        if ($attribute === self::VIEW) {
            return true; // owner + viewer
        }

        if ($attribute === self::EDIT) {
            return $ua->getRole() === 'owner';
        }

        return false;
    }
}
