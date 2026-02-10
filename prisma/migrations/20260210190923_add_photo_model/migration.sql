-- CreateTable
CREATE TABLE "Photo" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'other',
    "confidence" REAL NOT NULL DEFAULT 0,
    "tagsJson" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 1,
    "isHero" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Photo_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Photo_siteId_category_sortOrder_idx" ON "Photo"("siteId", "category", "sortOrder");

-- CreateIndex
CREATE INDEX "Photo_siteId_isDeleted_idx" ON "Photo"("siteId", "isDeleted");
