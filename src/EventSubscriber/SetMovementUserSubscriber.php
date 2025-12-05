<?php

namespace App\EventSubscriber;

use App\Entity\Movement;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Attribute\AsDoctrineListener;
use Doctrine\ORM\Event\PrePersistEventArgs;
use Doctrine\ORM\Events;
use Symfony\Bundle\SecurityBundle\Security;

#[AsDoctrineListener(event: Events::prePersist)]
class SetMovementUserSubscriber
{
    public function __construct(
        private Security $security
    ) {
    }

    public function prePersist(PrePersistEventArgs $args): void
    {
        $entity = $args->getObject();

        if (!$entity instanceof Movement) {
            return;
        }

        if ($entity->getUser() !== null) {
            return;
        }

        $user = $this->security->getUser();

        if ($user instanceof User) {
            $entity->setUser($user);
        }
    }
}
