<?php

namespace App\Doctrine\Filter;

use ApiPlatform\Doctrine\Orm\Filter\AbstractFilter;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Entity\Movement;
use Doctrine\ORM\QueryBuilder;

final class MovementSearchFilter extends AbstractFilter
{
    protected function filterProperty(
        string $property,
        mixed $value,
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = []
    ): void {
        if ($resourceClass !== Movement::class) {
            return;
        }

        if ($property !== 'q' || !is_string($value) || $value === '') {
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $parameterName = $queryNameGenerator->generateParameterName($property);
        $like = '%' . $value . '%';

        $queryBuilder
            ->andWhere(sprintf(
                '%s.name LIKE :%s OR %s.description LIKE :%s',
                $rootAlias,
                $parameterName,
                $rootAlias,
                $parameterName
            ))
            ->setParameter($parameterName, $like);
    }

    public function getDescription(string $resourceClass): array
    {
        if ($resourceClass !== Movement::class) {
            return [];
        }

        return [
            'q' => [
                'property' => null,
                'type' => 'string',
                'required' => false,
                'description' => 'Filter movements by name or description (OR).',
                'openapi' => [
                    'example' => 'salaire',
                ],
            ],
        ];
    }
}
