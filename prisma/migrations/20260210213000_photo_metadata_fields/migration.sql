-- AlterTable
ALTER TABLE "Photo" ADD COLUMN "categoryConfidence" REAL;
ALTER TABLE "Photo" ADD COLUMN "deletedAt" DATETIME;
ALTER TABLE "Photo" ADD COLUMN "googlePhotoRef" TEXT;

-- Backfill categoryConfidence from existing confidence for historical rows
UPDATE "Photo" SET "categoryConfidence" = "confidence" WHERE "categoryConfidence" IS NULL;

-- CreateIndex
CREATE INDEX "Photo_siteId_deletedAt_idx" ON "Photo"("siteId", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_siteId_googlePhotoRef_key" ON "Photo"("siteId", "googlePhotoRef");
