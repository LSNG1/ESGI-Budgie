<?php

namespace App\Controller\Api;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use App\Repository\UserRepository;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Account;
use App\Entity\UserAccount;
use App\Entity\Movement;
use App\Entity\User;

class AccountController extends AbstractController
{
    #[Route('/account', name: 'app_account')]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepository
    ): JsonResponse {

        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        if (empty($data['userId']) || empty($data['name']) || empty($data['type'])) {
            return $this->json(['error' => 'Champs requis manquants'], 400);
        }

        $user = $userRepository->find($data['userId']);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $account = new Account();
        $account->setName($data['name']);
        $account->setType($data['type']);
        $account->setDescription($data['description'] ?? null);
        $account->setTaxRate($data['taxRate'] ?? 0);
        $account->setRateOfPay($data['rateOfPay'] ?? 0);
        $account->setOverdraft($data['overdraft'] ?? 0);
        $date = new \DateTimeImmutable($data['createdAt']);
        $account->setCreatedAt($date);

        $em->persist($account);


        $userAccount = new UserAccount();
        $userAccount->setUser($user);
        $userAccount->setAccount($account);
        $userAccount->setRole('owner');

        $em->persist($userAccount);


        try {
            $em->flush();
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Erreur lors de la sauvegarde'], 500);
        }

        return $this->json([
            'message' => 'Compte créé avec succès',
            'accountId' => $account->getId()
        ], 201);
    }

    #[Route('/user-account/{userId}', name: 'get_user_accounts', methods: ['GET'])]
    public function getUserAccounts(int $userId, EntityManagerInterface $em): JsonResponse
    {

        $user = $em->getRepository(User::class)->find($userId);

        if (!$user) {
            return $this->json(['accounts' => []], 404);
        }

        $userAccounts = $em->getRepository(UserAccount::class)
            ->findBy(['user' => $user]);

        $accounts = [];

        foreach ($userAccounts as $userAccount) {
            $account = $userAccount->getAccount();

            $accounts[] = [
                'userAccountId' => $userAccount->getId(),
                'role' => $userAccount->getRole(),
                'account' => [
                    'id' => $account->getId(),
                    'name' => $account->getName(),
                    'type' => $account->getType(),
                    'description' => $account->getDescription(),
                    'taxRate' => $account->getTaxRate(),
                    'rateOfPay' => $account->getRateOfPay(),
                    'overdraft' => $account->getOverdraft(),
                    'userId' => $userAccount->getUser()->getId()
                ]
            ];
        }

        return $this->json([
            'userId' => $userId,
            'accounts' => $accounts
        ]);
    }

    #[Route('/account/movements/{accountId}', name: 'get_account_movements', methods: ['GET'])]
    public function getAccountMovements(int $accountId, EntityManagerInterface $em): JsonResponse
    {
        $movements = $em->getRepository(Movement::class)->findBy(['account' => $accountId]);

        if (!$movements) {
            return $this->json(['movements' => []]);
        }

        $movementData = [];

        foreach ($movements as $movement) {
            $movementData[] = [
                'id' => $movement->getId(),
                'name' => $movement->getName(),
                'type' => $movement->getType(),
                'amount' => $movement->getAmount(),
                'description' => $movement->getDescription(),
                'frequencyType' => $movement->getFrequencyType(),
                'frequencyN' => $movement->getFrequencyN(),
                'startDate' => $movement->getStartDate()->format('Y-m-d'),
                'endDate' => $movement->getEndDate() ? $movement->getEndDate()->format('Y-m-d') : null,
                'accountId' => $movement->getAccount()->getId(),
                'userId' => $movement->getUser()->getId(),
            ];
        }

        return $this->json([
            'accountId' => $accountId,
            'movements' => $movementData
        ]);
    }

    #[Route('/account/{accountId}', name: 'delete_account', methods: ['DELETE'])]
    public function deleteAccount(
        int $accountId,
        EntityManagerInterface $em
    ): JsonResponse {
        if ($accountId <= 0) {
            return $this->json([
                'error' => 'ID de compte invalide'
            ], 400);
        }

        try {
            $account = $em->getRepository(Account::class)->find($accountId);

            if (!$account) {
                return $this->json([
                    'error' => 'Compte introuvable'
                ], 404);
            }

            $userAccount = $em->getRepository(UserAccount::class)
                ->findOneBy(['account' => $account]);

            if (!$userAccount) {
                return $this->json([
                    'error' => 'Relation utilisateur-compte introuvable'
                ], 409);
            }

            $movements = $em->getRepository(Movement::class)
                ->findBy(['account' => $account]);
            foreach ($movements as $movement) {
                $em->remove($movement);
            }
            $em->remove($userAccount);
            $em->remove($account);
            
            $em->flush();

            return $this->json([
                'message' => 'Compte supprimé avec succès'
            ], 200);
        } catch (\Doctrine\DBAL\Exception\ForeignKeyConstraintViolationException $e) {
            return $this->json([
                'error' => 'Impossible de supprimer ce compte : dépendances existantes'
            ], 409);
        } catch (\Throwable $e) {
            return $this->json([
                'error' => 'Erreur interne du serveur',
                'details' => $e->getMessage() // enlève en prod
            ], 500);
        }
    }
}
