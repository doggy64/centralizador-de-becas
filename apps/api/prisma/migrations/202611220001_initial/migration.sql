-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Editorial" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'REJECTED', 'RETIRED');

-- CreateEnum
CREATE TYPE "Modality" AS ENUM ('ON_SITE', 'ONLINE', 'HYBRID', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Coverage" AS ENUM ('FULL', 'PARTIAL', 'UNKNOWN');

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "websiteUrl" TEXT,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "host" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "officialUrl" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "crawlAllowed" BOOLEAN NOT NULL DEFAULT false,
    "policyNote" TEXT NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("host")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "editionKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "sourceHost" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" "Editorial" NOT NULL DEFAULT 'DRAFT',
    "lastVerifiedAt" TIMESTAMP(3),
    "contentHash" TEXT NOT NULL,
    "searchText" TEXT NOT NULL,
    "startDate" TEXT,
    "deadlineDay" TEXT,
    "deadlineAt" TIMESTAMP(3),
    "originalDeadlineText" TEXT,
    "timeZone" TEXT,
    "modality" "Modality" NOT NULL DEFAULT 'UNKNOWN',
    "coverage" "Coverage" NOT NULL DEFAULT 'UNKNOWN',

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicLevel" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "AcademicLevel_pkey" PRIMARY KEY ("value")
);

-- CreateTable
CREATE TABLE "StudyArea" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "StudyArea_pkey" PRIMARY KEY ("value")
);

-- CreateTable
CREATE TABLE "Country" (
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "Country_pkey" PRIMARY KEY ("value")
);

-- CreateTable
CREATE TABLE "Evidence" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "excerpt" TEXT,
    "pageNumber" INTEGER,
    "fingerprint" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Requirement" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "document" BOOLEAN NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN,
    "evidenceId" TEXT NOT NULL,

    CONSTRAINT "Requirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "evidenceId" TEXT NOT NULL,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "verification" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "evidenceId" TEXT NOT NULL,

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewEvent" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IngestionRun" (
    "id" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "hash" TEXT,
    "message" TEXT,

    CONSTRAINT "IngestionRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ScholarshipToStudyArea" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ScholarshipToStudyArea_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AcademicLevelToScholarship" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_AcademicLevelToScholarship_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CountryToScholarship" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CountryToScholarship_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Program_institutionId_key_key" ON "Program"("institutionId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Scholarship_slug_key" ON "Scholarship"("slug");

-- CreateIndex
CREATE INDEX "Scholarship_status_slug_idx" ON "Scholarship"("status", "slug");

-- CreateIndex
CREATE INDEX "Scholarship_modality_coverage_idx" ON "Scholarship"("modality", "coverage");

-- CreateIndex
CREATE UNIQUE INDEX "Scholarship_programId_editionKey_key" ON "Scholarship"("programId", "editionKey");

-- CreateIndex
CREATE UNIQUE INDEX "Evidence_callId_fingerprint_key" ON "Evidence"("callId", "fingerprint");

-- CreateIndex
CREATE INDEX "Requirement_callId_idx" ON "Requirement"("callId");

-- CreateIndex
CREATE INDEX "Benefit_callId_idx" ON "Benefit"("callId");

-- CreateIndex
CREATE INDEX "Channel_callId_idx" ON "Channel"("callId");

-- CreateIndex
CREATE INDEX "ReviewEvent_callId_at_idx" ON "ReviewEvent"("callId", "at");

-- CreateIndex
CREATE INDEX "IngestionRun_host_startedAt_idx" ON "IngestionRun"("host", "startedAt");

-- CreateIndex
CREATE INDEX "_ScholarshipToStudyArea_B_index" ON "_ScholarshipToStudyArea"("B");

-- CreateIndex
CREATE INDEX "_AcademicLevelToScholarship_B_index" ON "_AcademicLevelToScholarship"("B");

-- CreateIndex
CREATE INDEX "_CountryToScholarship_B_index" ON "_CountryToScholarship"("B");

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_sourceHost_fkey" FOREIGN KEY ("sourceHost") REFERENCES "Source"("host") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evidence" ADD CONSTRAINT "Evidence_host_fkey" FOREIGN KEY ("host") REFERENCES "Source"("host") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Requirement" ADD CONSTRAINT "Requirement_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Channel" ADD CONSTRAINT "Channel_evidenceId_fkey" FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEvent" ADD CONSTRAINT "ReviewEvent_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Scholarship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngestionRun" ADD CONSTRAINT "IngestionRun_host_fkey" FOREIGN KEY ("host") REFERENCES "Source"("host") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScholarshipToStudyArea" ADD CONSTRAINT "_ScholarshipToStudyArea_A_fkey" FOREIGN KEY ("A") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ScholarshipToStudyArea" ADD CONSTRAINT "_ScholarshipToStudyArea_B_fkey" FOREIGN KEY ("B") REFERENCES "StudyArea"("value") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademicLevelToScholarship" ADD CONSTRAINT "_AcademicLevelToScholarship_A_fkey" FOREIGN KEY ("A") REFERENCES "AcademicLevel"("value") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AcademicLevelToScholarship" ADD CONSTRAINT "_AcademicLevelToScholarship_B_fkey" FOREIGN KEY ("B") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToScholarship" ADD CONSTRAINT "_CountryToScholarship_A_fkey" FOREIGN KEY ("A") REFERENCES "Country"("value") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToScholarship" ADD CONSTRAINT "_CountryToScholarship_B_fkey" FOREIGN KEY ("B") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
