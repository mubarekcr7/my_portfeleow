-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(320) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN') NOT NULL DEFAULT 'ADMIN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastLoginAt` DATETIME(3) NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Profile` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `name` VARCHAR(120) NOT NULL,
    `professionalTitle` VARCHAR(180) NOT NULL,
    `biography` TEXT NOT NULL,
    `email` VARCHAR(320) NULL,
    `location` VARCHAR(120) NOT NULL,
    `githubUrl` VARCHAR(500) NULL,
    `linkedInUrl` VARCHAR(500) NULL,
    `profileImage` VARCHAR(1000) NULL,
    `resumeFile` VARCHAR(1000) NULL,
    `seoTitle` VARCHAR(180) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `shortDescription` VARCHAR(320) NOT NULL,
    `fullDescription` TEXT NOT NULL,
    `problem` TEXT NULL,
    `solution` TEXT NULL,
    `features` JSON NOT NULL,
    `technologies` JSON NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `coverImage` VARCHAR(1000) NULL,
    `githubUrl` VARCHAR(500) NULL,
    `liveDemoUrl` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'DRAFT',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Project_slug_key`(`slug`),
    INDEX `Project_featured_displayOrder_idx`(`featured`, `displayOrder`),
    INDEX `Project_category_status_idx`(`category`, `status`),
    INDEX `Project_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectImage` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(1000) NOT NULL,
    `altText` VARCHAR(240) NOT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProjectImage_projectId_displayOrder_idx`(`projectId`, `displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Skill` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `category` VARCHAR(80) NOT NULL,
    `description` TEXT NULL,
    `icon` VARCHAR(80) NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `visibility` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Skill_name_key`(`name`),
    INDEX `Skill_category_displayOrder_idx`(`category`, `displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Education` (
    `id` VARCHAR(191) NOT NULL,
    `institution` VARCHAR(180) NOT NULL,
    `qualification` VARCHAR(180) NOT NULL,
    `fieldOfStudy` VARCHAR(180) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `description` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Education_displayOrder_startDate_idx`(`displayOrder`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Experience` (
    `id` VARCHAR(191) NOT NULL,
    `organization` VARCHAR(180) NOT NULL,
    `role` VARCHAR(180) NOT NULL,
    `employmentType` VARCHAR(80) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `description` TEXT NULL,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Experience_displayOrder_startDate_idx`(`displayOrder`, `startDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(160) NOT NULL,
    `description` TEXT NOT NULL,
    `icon` VARCHAR(80) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `displayOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Service_active_displayOrder_idx`(`active`, `displayOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `senderName` VARCHAR(120) NOT NULL,
    `senderEmail` VARCHAR(320) NOT NULL,
    `subject` VARCHAR(180) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('UNREAD', 'READ', 'ARCHIVED') NOT NULL DEFAULT 'UNREAD',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContactMessage_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `ContactMessage_senderEmail_idx`(`senderEmail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `siteTitle` VARCHAR(180) NOT NULL,
    `siteDescription` VARCHAR(320) NOT NULL,
    `socialLinks` JSON NOT NULL,
    `contactEmail` VARCHAR(320) NULL,
    `themePreferences` JSON NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `sid` VARCHAR(255) NOT NULL,
    `data` JSON NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    INDEX `Session_expires_idx`(`expires`),
    PRIMARY KEY (`sid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectImage` ADD CONSTRAINT `ProjectImage_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
