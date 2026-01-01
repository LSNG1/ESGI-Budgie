<?php

namespace App\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Entity\User;
use App\Entity\Movement;
use App\Entity\Account;
use App\Entity\UserAccount;
use Doctrine\ORM\EntityManagerInterface;

class UserController extends AbstractController
{
    #[Route('/user/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(int $id, EntityManagerInterface $em): JsonResponse
    {
        $user = $em->getRepository(User::class)->find($id);
        $user_accounts = $em->getRepository(UserAccount::class)->findBy(['user' => $user]);
        foreach ($user_accounts as $user_account) {
            $account = $user_account->getAccount();
            $movements = $em->getRepository(Movement::class)->findBy(['account' => $account]);

            foreach ($movements as $movement) {
                $em->remove($movement);
            }

            $em->remove($account);
            $em->remove($user_account);
        }

        if (!$user) {
            return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'Utilisateur supprimé avec succès'], Response::HTTP_OK);
    }
}
