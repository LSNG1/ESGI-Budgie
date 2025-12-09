# Contributing to Budgie

First off, thank you for considering contributing to Budgie! It's people like you that make Budgie such a great tool.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone git@github.com:YOUR_USERNAME/ESGI-Budgie.git
   cd ESGI-Budgie
   ```
3. **Create a branch** for your contribution:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Install dependencies**:
   ```bash
   composer install
   ```
5. **Set up your environment** (see [README.md](README.md) for detailed instructions)

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details** (PHP version, Symfony version, OS, etc.)

### ✨ Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** - Why is this enhancement useful?
- **Proposed solution** (if you have one)
- **Alternative solutions** you've considered

### 💻 Code Contributions

#### Good First Issues

Look for issues labeled `good first issue` if you're new to the project.

#### Areas for Contribution

- **Bug fixes**
- **New features**
- **Documentation improvements**
- **Test coverage**
- **Performance improvements**
- **Code refactoring**

## Development Process

### 1. Set Up Development Environment

Follow the [README.md](README.md) installation guide. Make sure you have:
- PHP 8.4+
- Composer
- MySQL 9.5+ or PostgreSQL 16
- Docker (optional but recommended)

### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation changes
- `refactor/` - for code refactoring
- `test/` - for test additions/modifications
- `chore/` - for maintenance tasks

### 3. Make Your Changes

- Write clean, maintainable code
- Follow [Symfony Best Practices](https://symfony.com/doc/current/best_practices.html)
- Add or update tests as needed
- Update documentation if necessary

### 4. Test Your Changes

```bash
# Clear cache
php bin/console cache:clear

# Run migrations
php bin/console doctrine:migrations:migrate

# Start the server
symfony server:start

# Test your changes manually through the API
```

### 5. Commit Your Changes

See [Commit Messages](#commit-messages) section below.

### 6. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### PHP Standards

We follow [PSR-12](https://www.php-fig.org/psr/psr-12/) coding standards and Symfony conventions.

#### Key Points

- **Indentation**: 4 spaces (no tabs)
- **Line length**: Aim for 120 characters max
- **Naming conventions**:
  - Classes: `PascalCase`
  - Methods/Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Properties: `camelCase`

#### Code Formatting

Use PHP CS Fixer (if configured):
```bash
php vendor/bin/php-cs-fixer fix
```

### Symfony Best Practices

- Use **dependency injection** instead of service location
- Keep controllers **thin** - business logic in services
- Use **typed properties** and **return types**
- Use **DTO** (Data Transfer Objects) for complex API responses
- Follow **SOLID principles**

### Entity Guidelines

```php
<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity]
#[ApiResource]
class Example
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column(type: 'integer')]
    private ?int $id = null;

    #[ORM\Column(type: 'string', length: 255)]
    #[Assert\NotBlank]
    #[Assert\Length(max: 255)]
    private string $name;

    // Getters and setters...
}
```

### Service Guidelines

```php
<?php

namespace App\Service;

readonly class ExampleService
{
    public function __construct(
        private SomeDependency $dependency,
    ) {
    }

    public function doSomething(): ResultDto
    {
        // Implementation
    }
}
```

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples

```bash
feat(account): add overdraft limit validation

Add validation to ensure overdraft limit is not negative and 
does not exceed the configured maximum.

Closes #123
```

```bash
fix(forecast): correct interest calculation for partial months

The interest calculation was incorrectly applying the full monthly
rate even for partial months at the start/end of the period.

Fixes #456
```

```bash
docs(readme): update installation instructions for Windows

Added specific instructions for Windows users regarding path
separators and command prompt usage.
```

### Commit Message Guidelines

- **Use the imperative mood** ("Add feature" not "Added feature")
- **First line** is the subject (max 50 chars)
- **Body** explains what and why (max 72 chars per line)
- **Footer** references issues (Closes #123, Fixes #456)

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's coding standards
- [ ] Self-review of your own code
- [ ] Comments added for complex logic
- [ ] Documentation updated (if needed)
- [ ] No new warnings or errors
- [ ] Tests added/updated (if applicable)
- [ ] All tests pass
- [ ] Database migrations created (if schema changed)

### PR Template

When creating a PR, our template will guide you. Include:

1. **Description** of the change
2. **Motivation** - why is this change needed?
3. **Type of change** (bug fix, feature, etc.)
4. **Testing** done
5. **Screenshots** (for UI changes)
6. **Related issues**

### PR Review Process

1. **Automated checks** must pass (CI/CD when configured)
2. **At least one approval** required
3. **Address review comments**
4. **Squash commits** if requested
5. **Maintainer will merge**

### After Your PR is Merged

- Delete your feature branch
- Pull the latest changes from main
- Celebrate! 🎉

## Testing Guidelines

### Unit Tests

```php
<?php

namespace App\Tests\Service;

use App\Service\ExampleService;
use PHPUnit\Framework\TestCase;

class ExampleServiceTest extends TestCase
{
    public function testDoSomething(): void
    {
        $service = new ExampleService();
        $result = $service->doSomething();
        
        $this->assertInstanceOf(ResultDto::class, $result);
    }
}
```

### API Tests

```php
<?php

namespace App\Tests\Api;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;

class AccountTest extends ApiTestCase
{
    public function testGetAccount(): void
    {
        $response = static::createClient()->request('GET', '/api/accounts/1');

        $this->assertResponseIsSuccessful();
        $this->assertJsonContains(['@type' => 'Account']);
    }
}
```

### Running Tests

```bash
# Run all tests
php bin/phpunit

# Run specific test
php bin/phpunit tests/Service/ExampleServiceTest.php

# Run with coverage
php bin/phpunit --coverage-html coverage
```

## Documentation

### Code Documentation

Use PHPDoc for classes and methods:

```php
/**
 * Calculates the forecast for a financial account.
 *
 * This service takes into account movements, exceptions, and interest
 * rates to project future account balances.
 *
 * @author Your Name <your.email@example.com>
 */
class ForecastCalculator
{
    /**
     * Calculate forecast up to the target date.
     *
     * @param Account   $account    The account to forecast
     * @param \DateTime $targetDate The end date for the forecast
     *
     * @return ForecastResult The calculated forecast
     *
     * @throws \InvalidArgumentException If target date is in the past
     */
    public function calculate(Account $account, \DateTime $targetDate): ForecastResult
    {
        // Implementation
    }
}
```

### API Documentation

Use API Platform attributes for API documentation:

```php
#[ApiResource(
    operations: [
        new Get(
            uriTemplate: '/accounts/{id}/forecast',
            description: 'Get account balance forecast'
        ),
    ]
)]
```

## Questions?

Feel free to:
- Open an issue with the `question` label
- Contact the maintainers
- Join our discussions

## Recognition

Contributors will be recognized in our README.md and release notes.

Thank you for contributing! 🙏
