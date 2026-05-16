-- Set initial session variables
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Drop tables in reverse order of dependencies to avoid foreign key errors
DROP TABLE IF EXISTS `personal_access_tokens`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `obtenir`;
DROP TABLE IF EXISTS `enseigner`;
DROP TABLE IF EXISTS `conges`;
DROP TABLE IF EXISTS `absences`;
DROP TABLE IF EXISTS `personnels`;
DROP TABLE IF EXISTS `diplomes`;
DROP TABLE IF EXISTS `specialites`;
DROP TABLE IF EXISTS `etablissements`;
DROP TABLE IF EXISTS `job_batches`;
DROP TABLE IF EXISTS `failed_jobs`;
DROP TABLE IF EXISTS `jobs`;
DROP TABLE IF EXISTS `cache`;
DROP TABLE IF EXISTS `cache_locks`;
DROP TABLE IF EXISTS `migrations`;

-- Create tables in proper order
CREATE TABLE `etablissements` (
  `idEtab` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `ville` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idEtab`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `specialites` (
  `idSpecialite` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nom_specialite` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idSpecialite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `diplomes` (
  `idDiplome` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `nom_diplome` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idDiplome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personnels` (
  `idPersonnel` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `type_personnel` enum('formateur','administratif') NOT NULL,
  `statut` enum('permanent','vacataire') NOT NULL,
  `CIN` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `situation_familiale` varchar(255) DEFAULT NULL,
  `adresse_actuelle` varchar(255) DEFAULT NULL,
  `lieu_naissance` varchar(255) DEFAULT NULL,
  `nombre_enfant` varchar(255) DEFAULT NULL,
  `telephone` varchar(255) DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `echelon` varchar(255) DEFAULT NULL,
  `fonction` varchar(255) DEFAULT NULL,
  `contact_nom` varchar(255) DEFAULT NULL,
  `contact_telephone` varchar(20) DEFAULT NULL,
  `idEtab` bigint(20) unsigned NOT NULL,
  `idSpecialite` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idPersonnel`),
  UNIQUE KEY `personnels_cin_unique` (`CIN`),
  KEY `personnels_idetab_foreign` (`idEtab`),
  KEY `personnels_idspecialite_foreign` (`idSpecialite`),
  CONSTRAINT `personnels_idetab_foreign` FOREIGN KEY (`idEtab`) REFERENCES `etablissements` (`idEtab`) ON DELETE CASCADE,
  CONSTRAINT `personnels_idspecialite_foreign` FOREIGN KEY (`idSpecialite`) REFERENCES `specialites` (`idSpecialite`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `Role` enum('directeurducomlex','gestionnairecfmr') NOT NULL,
  `idPersonnel` bigint(20) unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_username_unique` (`username`),
  UNIQUE KEY `users_idpersonnel_unique` (`idPersonnel`),
  CONSTRAINT `users_idpersonnel_foreign` FOREIGN KEY (`idPersonnel`) REFERENCES `personnels` (`idPersonnel`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `absences` (
  `idAbsence` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date_absence` date NOT NULL,
  `motif` varchar(255) DEFAULT NULL,
  `idPersonnel` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idAbsence`),
  KEY `absences_idpersonnel_foreign` (`idPersonnel`),
  CONSTRAINT `absences_idpersonnel_foreign` FOREIGN KEY (`idPersonnel`) REFERENCES `personnels` (`idPersonnel`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `conges` (
  `idConge` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `date_debut` date NOT NULL,
  `date_fin` date NOT NULL,
  `date_demande` date NOT NULL,
  `type_conge` varchar(255) NOT NULL,
  `statut` varchar(255) NOT NULL,
  `idPersonnel` bigint(20) unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`idConge`),
  KEY `conges_idpersonnel_foreign` (`idPersonnel`),
  CONSTRAINT `conges_idpersonnel_foreign` FOREIGN KEY (`idPersonnel`) REFERENCES `personnels` (`idPersonnel`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `obtenir` (
  `idPersonnel` bigint(20) unsigned NOT NULL,
  `idDiplome` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`idPersonnel`,`idDiplome`),
  KEY `obtenir_iddiplome_foreign` (`idDiplome`),
  CONSTRAINT `obtenir_iddiplome_foreign` FOREIGN KEY (`idDiplome`) REFERENCES `diplomes` (`idDiplome`) ON DELETE CASCADE,
  CONSTRAINT `obtenir_idpersonnel_foreign` FOREIGN KEY (`idPersonnel`) REFERENCES `personnels` (`idPersonnel`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `enseigner` (
  `idPersonnel` bigint(20) unsigned NOT NULL,
  `idSpecialite` bigint(20) unsigned NOT NULL,
  PRIMARY KEY (`idPersonnel`,`idSpecialite`),
  KEY `enseigner_idspecialite_foreign` (`idSpecialite`),
  CONSTRAINT `enseigner_idpersonnel_foreign` FOREIGN KEY (`idPersonnel`) REFERENCES `personnels` (`idPersonnel`) ON DELETE CASCADE,
  CONSTRAINT `enseigner_idspecialite_foreign` FOREIGN KEY (`idSpecialite`) REFERENCES `specialites` (`idSpecialite`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert migration records
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES 
(1,'0001_01_01_000001_create_cache_table',1),
(2,'0001_01_01_000002_create_jobs_table',1),
(3,'2026_04_09_114128_create_etablissements_table',1),
(4,'2026_04_10_113955_create_specialites_table',1),
(5,'2026_04_11_004002_create_diplomes_table',1),
(6,'2026_04_11_004116_create_personnels_table',1),
(7,'2026_04_12_002824_create_users_table',1),
(8,'2026_04_12_002958_create_absences_table',1),
(9,'2026_04_12_113945_create_conges_table',1),
(10,'2026_04_13_114029_create_obtenir_table',1),
(11,'2026_04_13_114031_create_enseigner_table',1),
(12,'2026_04_15_082412_create_sessions_table',1),
(13,'2026_04_16_104242_create_personal_access_tokens_table',1);

-- Reset session variables
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
