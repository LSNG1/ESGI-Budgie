# Budgie - Financial Management API

A comprehensive financial management application built with Symfony 8.0 and API Platform. Budgie helps users manage their financial accounts, track income and expenses, handle recurring transactions, and forecast future account balances based on movements and interest rates.

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Database Setup](#-database-setup)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Core Entities](#-core-entities)
- [Usage Examples](#-usage-examples)
- [Security](#-security)
- [Contributing](#-contributing)

## ✨ Features

- **User Management**: Complete user authentication and authorization system
- **Account Management**: Create and manage multiple financial accounts with customizable settings
- **Movement Tracking**: Track income and expenses with support for one-time and recurring transactions
- **Flexible Frequencies**: Support for various transaction frequencies (once, every N months)
- **Movement Exceptions**: Override specific occurrences of recurring movements
- **Financial Forecasting**: Advanced calculation engine that predicts future account balances
- **Interest Calculation**: Automatic interest calculation with configurable tax rates
- **Subscription System**: Tiered subscription model with limits on accounts and movements
- **RESTful API**: Full REST API with comprehensive documentation
- **CORS Support**: Configured for cross-origin requests

## 🛠 Technology Stack

- **Backend Framework**: Symfony 8.0
- **API Framework**: API Platform 4.2.8
- **PHP Version**: 8.4+
- **Database ORM**: Doctrine ORM 3.5
- **Database**: MySQL 9.5 (or PostgreSQL 16 via Docker)
- **Security**: Symfony Security Bundle
- **Template Engine**: Twig
- **Additional Bundles**:
  - Doctrine Migrations
  - Nelmio CORS Bundle
  - Symfony Maker Bundle

## 📦 Prerequisites

Before installing Budgie, ensure you have the following installed:

- **PHP 8.4 or higher**
  - Required extensions: `ctype`, `iconv`
- **Composer** (latest version)
- **MySQL 9.5** or **PostgreSQL 16** (or Docker/Docker Compose)
- **Git**

### Optional but Recommended

- **Symfony CLI** - For running the development server
- **Docker & Docker Compose** - For containerized database

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone git@github.com:LSNG1/ESGI-Budgie.git
cd ESGI-Budgie
```

### 2. Install Dependencies

```bash
composer install
```

This will install all required PHP dependencies including Symfony, API Platform, and Doctrine.

## ⚙ Configuration

### 1. Environment Variables

Copy the `.env` file and create a `.env.local` file for your local configuration:

```bash
cp .env .env.local
```

### 2. Configure the Database

Edit your `.env.local` file and configure the database connection:

#### For MySQL:

```env
DATABASE_URL="mysql://username:password@localhost:3306/budgie?serverVersion=9.5&charset=utf8mb4"
```

Replace:
- `username` with your MySQL username
- `password` with your MySQL password
- `localhost:3306` with your MySQL host and port if different
- `budgie` with your desired database name

#### For PostgreSQL (Docker):

If using the provided Docker setup:

```env
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
```

### 3. Configure Application Secret

Generate a secure APP_SECRET or use the provided one:

```env
APP_SECRET=your-secure-random-secret-here
```

### 4. Configure CORS (Optional)

If you need to customize CORS settings:

```env
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
```

## 🗄 Database Setup

### Option 1: Using Docker (Recommended)

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

This will start a PostgreSQL 16 instance on port 5432.

### Option 2: Using Local MySQL/PostgreSQL

Ensure your MySQL or PostgreSQL server is running and create the database:

#### MySQL:
```bash
mysql -u root -p
CREATE DATABASE budgie CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE budgie;
```

### Create Database Schema

Run the Doctrine migrations to create all tables:

```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

Or use Symfony CLI:

```bash
symfony console doctrine:database:create
symfony console doctrine:migrations:migrate
```

## 🏃 Running the Application

### Using Symfony CLI (Recommended)

```bash
symfony server:start
```

The application will be available at `http://localhost:8000`

### Using PHP Built-in Server

```bash
php -S localhost:8000 -t public
```

### Production Deployment

For production, configure your web server (Apache/Nginx) to point to the `public/` directory.

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

**API Platform Interface**: `http://localhost:8000/api`

### Available API Endpoints

#### Users
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get a specific user
- `POST /api/users` - Create a new user
- `PATCH /api/users/{id}` - Update a user
- `DELETE /api/users/{id}` - Delete a user

#### Accounts
- `GET /api/accounts` - List all accounts
- `GET /api/accounts/{id}` - Get a specific account
- `POST /api/accounts` - Create a new account
- `PATCH /api/accounts/{id}` - Update an account
- `DELETE /api/accounts/{id}` - Delete an account
- `GET /api/accounts/{id}/forecast` - Get forecast for an account

#### Movements (Income/Expenses)
- `GET /api/movements` - List all movements
- `GET /api/movements/{id}` - Get a specific movement
- `POST /api/movements` - Create a new movement
- `PATCH /api/movements/{id}` - Update a movement
- `DELETE /api/movements/{id}` - Delete a movement

#### Movement Exceptions
- `GET /api/movement_exceptions` - List all exceptions
- `GET /api/movement_exceptions/{id}` - Get a specific exception
- `POST /api/movement_exceptions` - Create a new exception
- `PATCH /api/movement_exceptions/{id}` - Update an exception
- `DELETE /api/movement_exceptions/{id}` - Delete an exception

#### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `GET /api/subscriptions/{id}` - Get a specific subscription
- `POST /api/subscriptions` - Create a new subscription
- `PATCH /api/subscriptions/{id}` - Update a subscription
- `DELETE /api/subscriptions/{id}` - Delete a subscription

### Authentication

The API uses form-based authentication. To access protected endpoints:

1. Navigate to `/login`
2. Submit credentials via POST to `/login`
3. Session-based authentication will be maintained

Access control:
- `/api/*` routes require `ROLE_USER`
- `/login` is publicly accessible

## 📁 Project Structure

```
ESGI-Budgie/
├── bin/
│   └── console              # Symfony console commands
├── config/
│   ├── packages/            # Bundle configurations
│   │   ├── api_platform.yaml
│   │   ├── doctrine.yaml
│   │   ├── security.yaml
│   │   └── ...
│   ├── routes/              # Routing configuration
│   ├── bundles.php
│   └── services.yaml        # Service container configuration
├── migrations/              # Database migrations
├── public/
│   └── index.php            # Application entry point
├── src/
│   ├── Controller/          # Controllers
│   │   └── AppLoginAuthenticatorController.php
│   ├── Dto/                 # Data Transfer Objects
│   │   └── ForecastResult.php
│   ├── Entity/              # Doctrine entities
│   │   ├── Account.php
│   │   ├── Movement.php
│   │   ├── MovementException.php
│   │   ├── Subscription.php
│   │   ├── User.php
│   │   └── UserAccount.php
│   ├── EventSubscriber/     # Event subscribers
│   │   └── SetMovementUserSubscriber.php
│   ├── Repository/          # Doctrine repositories
│   ├── Security/            # Security components
│   │   └── Voter/
│   │       └── AccountVoter.php
│   ├── Service/             # Business logic services
│   │   ├── ForecastCalculator.php
│   │   └── ForecastResultValue.php
│   ├── State/               # API Platform state providers
│   │   └── ForecastProvider.php
│   └── Kernel.php
├── templates/               # Twig templates
├── var/                     # Cache, logs, sessions
├── .env                     # Environment variables (template)
├── .env.dev                 # Development environment
├── composer.json            # PHP dependencies
├── compose.yaml             # Docker Compose configuration
└── symfony.lock             # Symfony Flex lock file
```

## 🔍 Core Entities

### User
Represents a user in the system with authentication capabilities.

**Key Properties:**
- Email (unique identifier)
- Password (hashed)
- First name, Last name
- Phone, Fiscal number
- Verified status
- Subscription (relation)
- Roles (array)

### Account
Represents a financial account (bank account, savings, etc.).

**Key Properties:**
- Name
- Type (e.g., checking, savings)
- Description
- Tax rate (for interest taxation)
- Rate of pay (annual interest rate)
- Overdraft limit
- Created date
- Movements (relation)

### Movement
Represents income or expense transactions with support for recurring patterns.

**Key Properties:**
- Name
- Description
- Type (`income` or `expense`)
- Amount
- Frequency type (`once` or `every_n_months`)
- Frequency N (interval in months)
- Start date
- End date (optional)
- Account (relation)
- User (relation)
- Exceptions (relation)

### MovementException
Overrides specific occurrences of recurring movements.

**Key Properties:**
- Description
- Amount (override amount)
- Start date
- End date (optional)
- Frequency type
- Frequency N
- Movement (relation)

### Subscription
Defines subscription tiers with limits.

**Key Properties:**
- Name
- Max accounts
- Max incomes
- Max expenses

### UserAccount
Junction entity for user-account relationships with roles.

**Key Properties:**
- User (relation)
- Account (relation)
- Role (e.g., owner, viewer)
- Created date

## 💡 Usage Examples

### Creating an Account

```json
POST /api/accounts
Content-Type: application/json

{
  "name": "My Savings Account",
  "type": "savings",
  "description": "Personal savings",
  "taxRate": "0.3000",
  "rateOfPay": "0.0250",
  "overdraft": "0.00"
}
```

### Creating a Recurring Income

```json
POST /api/movements
Content-Type: application/json

{
  "account": "/api/accounts/1",
  "name": "Monthly Salary",
  "description": "Software Engineer Salary",
  "type": "income",
  "amount": "5000.00",
  "frequencyType": "every_n_months",
  "frequencyN": 1,
  "startDate": "2025-01-01",
  "endDate": null
}
```

### Creating a One-Time Expense

```json
POST /api/movements
Content-Type: application/json

{
  "account": "/api/accounts/1",
  "name": "New Laptop",
  "description": "MacBook Pro",
  "type": "expense",
  "amount": "2500.00",
  "frequencyType": "once",
  "frequencyN": null,
  "startDate": "2025-01-15",
  "endDate": null
}
```

### Getting Account Forecast

```
GET /api/accounts/1/forecast?targetDate=2025-12-31
```

**Response:**
```json
{
  "accountId": 1,
  "targetDate": "2025-12-31",
  "balance": 45230.50,
  "monthlyBreakdown": {
    "2025-01": {
      "incomes": 5000.00,
      "expenses": 1200.00,
      "interestNet": 8.75,
      "balance": 3808.75
    },
    "2025-02": {
      "incomes": 5000.00,
      "expenses": 1200.00,
      "interestNet": 16.56,
      "balance": 7625.31
    }
    // ... more months
  }
}
```

## 🔒 Security

### Authentication
- Form-based login at `/login`
- Session-based authentication
- Password hashing using Symfony's auto algorithm

### Authorization
- Role-based access control (RBAC)
- `ROLE_USER` required for API access
- Custom voters for fine-grained permissions (e.g., `AccountVoter`)

### CSRF Protection
- Enabled for form login
- Token validation on authentication

## 📝 Development Commands

### Clear Cache
```bash
php bin/console cache:clear
```

### Create a New Entity
```bash
php bin/console make:entity
```

### Generate Migration
```bash
php bin/console make:migration
```

### Run Migrations
```bash
php bin/console doctrine:migrations:migrate
```

### View Routes
```bash
php bin/console debug:router
```

### View Services
```bash
php bin/console debug:container
```

## 🧪 Testing

(Testing setup can be added here when implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software.

## 👥 Authors

- LSNG1 - [GitHub](https://github.com/LSNG1)

## 🙏 Acknowledgments

- Symfony Framework
- API Platform
- Doctrine ORM
- ESGI - École Supérieure de Génie Informatique

---

**Note**: This is an educational project developed as part of ESGI coursework.
