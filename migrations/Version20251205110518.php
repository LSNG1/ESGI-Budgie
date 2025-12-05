<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251205110518 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE account (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(150) NOT NULL, type VARCHAR(50) DEFAULT NULL, description LONGTEXT DEFAULT NULL, tax_rate NUMERIC(5, 4) NOT NULL, rate_of_pay NUMERIC(6, 4) NOT NULL, overdraft NUMERIC(15, 4) NOT NULL, created_at DATETIME NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE movement (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(150) NOT NULL, description LONGTEXT DEFAULT NULL, type VARCHAR(20) NOT NULL, amount NUMERIC(15, 2) NOT NULL, frequency_type VARCHAR(20) NOT NULL, frequency_n INT DEFAULT NULL, start_date DATE NOT NULL, end_date DATE DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, account_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_F4DD95F79B6B5FBA (account_id), INDEX IDX_F4DD95F7A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE movement_exception (id INT AUTO_INCREMENT NOT NULL, description LONGTEXT DEFAULT NULL, amount NUMERIC(15, 2) NOT NULL, start_date DATE NOT NULL, end_date DATE DEFAULT NULL, frequency_type VARCHAR(20) NOT NULL, frequency_n INT DEFAULT NULL, created_at DATETIME NOT NULL, movement_id INT NOT NULL, INDEX IDX_4DEEC2E6229E70A7 (movement_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE subscription (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(100) NOT NULL, max_accounts INT DEFAULT NULL, max_incomes INT DEFAULT NULL, max_expenses INT DEFAULT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(100) DEFAULT NULL, lastname VARCHAR(100) DEFAULT NULL, phone VARCHAR(30) DEFAULT NULL, fiscal_num VARCHAR(50) DEFAULT NULL, verified TINYINT NOT NULL, subscription_id INT DEFAULT NULL, INDEX IDX_8D93D6499A1887DC (subscription_id), UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE user_account (id INT AUTO_INCREMENT NOT NULL, role VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, account_id INT NOT NULL, INDEX IDX_253B48AEA76ED395 (user_id), INDEX IDX_253B48AE9B6B5FBA (account_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE movement ADD CONSTRAINT FK_F4DD95F79B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id)');
        $this->addSql('ALTER TABLE movement ADD CONSTRAINT FK_F4DD95F7A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE movement_exception ADD CONSTRAINT FK_4DEEC2E6229E70A7 FOREIGN KEY (movement_id) REFERENCES movement (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D6499A1887DC FOREIGN KEY (subscription_id) REFERENCES subscription (id)');
        $this->addSql('ALTER TABLE user_account ADD CONSTRAINT FK_253B48AEA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user_account ADD CONSTRAINT FK_253B48AE9B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE movement DROP FOREIGN KEY FK_F4DD95F79B6B5FBA');
        $this->addSql('ALTER TABLE movement DROP FOREIGN KEY FK_F4DD95F7A76ED395');
        $this->addSql('ALTER TABLE movement_exception DROP FOREIGN KEY FK_4DEEC2E6229E70A7');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D6499A1887DC');
        $this->addSql('ALTER TABLE user_account DROP FOREIGN KEY FK_253B48AEA76ED395');
        $this->addSql('ALTER TABLE user_account DROP FOREIGN KEY FK_253B48AE9B6B5FBA');
        $this->addSql('DROP TABLE account');
        $this->addSql('DROP TABLE movement');
        $this->addSql('DROP TABLE movement_exception');
        $this->addSql('DROP TABLE subscription');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE user_account');
    }
}
