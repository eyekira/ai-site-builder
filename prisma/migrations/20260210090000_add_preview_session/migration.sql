-- CreateTable
CREATE TABLE "PreviewSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dataJson" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "PreviewSession_expiresAt_idx" ON "PreviewSession"("expiresAt");
