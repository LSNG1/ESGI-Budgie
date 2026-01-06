<?php

namespace App\DataFixtures;

use App\Entity\Account;
use App\Entity\Movement;
use App\Entity\MovementException;
use App\Entity\Subscription;
use App\Entity\User;
use App\Entity\UserAccount;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class AppFixtures extends Fixture
{
    public function __construct(private UserPasswordHasherInterface $hasher) {}

    public function load(ObjectManager $manager): void
    {
        $faker = \Faker\Factory::create('fr_FR');
        $faker->seed(202501);

        $free = (new Subscription())
            ->setName('Gratuit')
            ->setMaxAccounts(2)
            ->setMaxExpenses(7)
            ->setMaxIncomes(2);

        $paid = (new Subscription())
            ->setName('Premium')
            ->setMaxAccounts(null)
            ->setMaxExpenses(null)
            ->setMaxIncomes(null);

        $manager->persist($free);
        $manager->persist($paid);

        $userCount = 3;
        $accountsPerUser = 2;
        $movementsPerAccount = 10;

        for ($u = 0; $u < $userCount; $u++) {
            $user = (new User())
                ->setEmail("demo{$u}@budgie.local")
                ->setFirstname($faker->firstName())
                ->setLastname($faker->lastName())
                ->setPhone($faker->numerify('0#########'))
                ->setFiscalNum($faker->numerify('############'))
                ->setVerified(true)
                ->setSubscription($u === 0 ? $free : $paid);

            if ($u === 0) {
                $user->setRoles(['ROLE_ADMIN']);
            }

            $user->setPassword($this->hasher->hashPassword($user, 'Password123!'));
            $manager->persist($user);

            if ($u === 0) {
                $sampleAccounts = [
                    [
                        'name' => 'Societe Generale',
                        'type' => 'depot',
                        'description' => 'Compte courant individuel',
                        'createdAt' => '2005-01-01',
                        'rateOfPay' => '0.0000',
                        'taxRate' => '0.0000',
                    ],
                    [
                        'name' => 'Livret A',
                        'type' => 'savings',
                        'description' => 'Livret A individuel',
                        'createdAt' => '2010-01-01',
                        'rateOfPay' => '0.0170',
                        'taxRate' => '0.0000',
                    ],
                    [
                        'name' => 'Compte Titre Ordinaire',
                        'type' => 'credit',
                        'description' => "Compte d'investissement individuel",
                        'createdAt' => '2010-01-01',
                        'rateOfPay' => '0.0700',
                        'taxRate' => '0.3000',
                    ],
                ];

                foreach ($sampleAccounts as $sampleAccount) {
                    $account = (new Account())
                        ->setName($sampleAccount['name'])
                        ->setType($sampleAccount['type'])
                        ->setDescription($sampleAccount['description'])
                        ->setTaxRate($sampleAccount['taxRate'])
                        ->setRateOfPay($sampleAccount['rateOfPay'])
                        ->setOverdraft('0.00')
                        ->setCreatedAt(new \DateTimeImmutable($sampleAccount['createdAt']));

                    $manager->persist($account);

                    $ua = (new UserAccount())
                        ->setUser($user)
                        ->setAccount($account)
                        ->setRole('owner');
                    $manager->persist($ua);
                }
            }

            for ($a = 0; $a < $accountsPerUser; $a++) {
                $account = (new Account())
                    ->setName($faker->words(2, true))
                    ->setType($faker->randomElement(['depot', 'savings', 'credit']))
                    ->setDescription($faker->sentence())
                    ->setTaxRate(number_format($faker->randomFloat(4, 0, 0.30), 4, '.', ''))
                    ->setRateOfPay(number_format($faker->randomFloat(4, 0, 0.10), 4, '.', ''))
                    ->setOverdraft(number_format($faker->randomFloat(2, 0, 2000), 2, '.', ''))
                    ->setCreatedAt(new \DateTimeImmutable('2020-01-01'));

                $manager->persist($account);

                $ua = (new UserAccount())
                    ->setUser($user)
                    ->setAccount($account)
                    ->setRole('owner');
                $manager->persist($ua);

                for ($m = 0; $m < $movementsPerAccount; $m++) {
                    $frequencyType = $faker->randomElement(['once', 'every_n_months']);
                    $start = new \DateTimeImmutable(
                        $faker->dateTimeBetween('-3 years', 'now')->format('Y-m-d')
                    );

                    $end = $frequencyType === 'once'
                        ? null
                        : new \DateTimeImmutable(
                            $faker->dateTimeBetween('now', '+2 years')->format('Y-m-d')
                        );

                    $movement = (new Movement())
                        ->setAccount($account)
                        ->setUser($user)
                        ->setName($faker->words(2, true))
                        ->setDescription($faker->sentence())
                        ->setType($faker->randomElement(['income', 'expense']))
                        ->setAmount(number_format($faker->randomFloat(2, 10, 5000), 2, '.', ''))
                        ->setFrequencyType($frequencyType)
                        ->setFrequencyN($frequencyType === 'every_n_months' ? $faker->numberBetween(1, 12) : null)
                        ->setStartDate($start)
                        ->setEndDate($end);

                    $manager->persist($movement);

                    if ($faker->boolean(15)) {
                        $exceptionStart = $start->modify('+6 months');
                        $exception = (new MovementException())
                            ->setMovement($movement)
                            ->setName($faker->words(2, true))
                            ->setDescription($faker->sentence())
                            ->setAmount(number_format($faker->randomFloat(2, 5, 2000), 2, '.', ''))
                            ->setStartDate($exceptionStart)
                            ->setEndDate($frequencyType === 'once' ? $exceptionStart : $exceptionStart->modify('+6 months'))
                            ->setFrequencyType($frequencyType)
                            ->setFrequencyN($frequencyType === 'every_n_months' ? $faker->numberBetween(1, 12) : null);

                        $manager->persist($exception);
                    }
                }
            }
        }

        $manager->flush();
    }
}
