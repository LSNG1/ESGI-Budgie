<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260106145431 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE account_invite (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, token VARCHAR(64) NOT NULL, role VARCHAR(20) NOT NULL, status VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, expires_at DATE DEFAULT NULL, accepted_at DATETIME DEFAULT NULL, account_id INT NOT NULL, accepted_by_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_E0D6DEA45F37A13B (token), INDEX IDX_E0D6DEA49B6B5FBA (account_id), INDEX IDX_E0D6DEA420F699D9 (accepted_by_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE account_invite ADD CONSTRAINT FK_E0D6DEA49B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id)');
        $this->addSql('ALTER TABLE account_invite ADD CONSTRAINT FK_E0D6DEA420F699D9 FOREIGN KEY (accepted_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE movement_exception ADD name VARCHAR(150) NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE account_invite DROP FOREIGN KEY FK_E0D6DEA49B6B5FBA');
        $this->addSql('ALTER TABLE account_invite DROP FOREIGN KEY FK_E0D6DEA420F699D9');
        $this->addSql('DROP TABLE account_invite');
        $this->addSql('ALTER TABLE movement_exception DROP name');
    }
}
