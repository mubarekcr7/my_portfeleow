CREATE TYPE "AdminRole" AS ENUM ('ADMIN');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "MessageStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "name" VARCHAR(120) NOT NULL,
    "professionalTitle" VARCHAR(180) NOT NULL,
    "biography" TEXT NOT NULL,
    "email" VARCHAR(320),
    "location" VARCHAR(120) NOT NULL,
    "githubUrl" VARCHAR(500),
    "linkedInUrl" VARCHAR(500),
    "profileImage" VARCHAR(1000),
    "resumeFile" VARCHAR(1000),
    "seoTitle" VARCHAR(180),
    "seoDescription" VARCHAR(320),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "shortDescription" VARCHAR(320) NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "problem" TEXT,
    "solution" TEXT,
    "features" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "technologies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "category" VARCHAR(80) NOT NULL,
    "coverImage" VARCHAR(1000),
    "githubUrl" VARCHAR(500),
    "liveDemoUrl" VARCHAR(500),
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ProjectImage" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "imageUrl" VARCHAR(1000) NOT NULL,
    "altText" VARCHAR(240) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectImage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(80),
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "visibility" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Education" (
    "id" TEXT NOT NULL,
    "institution" VARCHAR(180) NOT NULL,
    "qualification" VARCHAR(180) NOT NULL,
    "fieldOfStudy" VARCHAR(180) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Experience" (
    "id" TEXT NOT NULL,
    "organization" VARCHAR(180) NOT NULL,
    "role" VARCHAR(180) NOT NULL,
    "employmentType" VARCHAR(80) NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Experience_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "icon" VARCHAR(80),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "senderName" VARCHAR(120) NOT NULL,
    "senderEmail" VARCHAR(320) NOT NULL,
    "subject" VARCHAR(180) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'UNREAD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "siteTitle" VARCHAR(180) NOT NULL,
    "siteDescription" VARCHAR(320) NOT NULL,
    "socialLinks" JSONB NOT NULL DEFAULT '{}',
    "contactEmail" VARCHAR(320),
    "themePreferences" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE INDEX "Project_featured_displayOrder_idx" ON "Project"("featured", "displayOrder");
CREATE INDEX "Project_category_status_idx" ON "Project"("category", "status");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");
CREATE INDEX "ProjectImage_projectId_displayOrder_idx" ON "ProjectImage"("projectId", "displayOrder");
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");
CREATE INDEX "Skill_category_displayOrder_idx" ON "Skill"("category", "displayOrder");
CREATE INDEX "Education_displayOrder_startDate_idx" ON "Education"("displayOrder", "startDate");
CREATE INDEX "Experience_displayOrder_startDate_idx" ON "Experience"("displayOrder", "startDate");
CREATE INDEX "Service_active_displayOrder_idx" ON "Service"("active", "displayOrder");
CREATE INDEX "ContactMessage_status_createdAt_idx" ON "ContactMessage"("status", "createdAt");
CREATE INDEX "ContactMessage_senderEmail_idx" ON "ContactMessage"("senderEmail");

ALTER TABLE "ProjectImage" ADD CONSTRAINT "ProjectImage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;