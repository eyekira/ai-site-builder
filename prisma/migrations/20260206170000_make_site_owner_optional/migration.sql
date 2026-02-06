PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "previewToken" TEXT,
    "themeJson" TEXT,
    "ownerId" INTEGER,
    "placeId" TEXT,
    CONSTRAINT "Site_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Site_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Site" ("id", "slug", "title", "status", "publishedAt", "previewToken", "themeJson", "ownerId", "placeId")
SELECT "id", "slug", "title", "status", "publishedAt", "previewToken", "themeJson", "ownerId", "placeId"
FROM "Site";

DROP TABLE "Site";

ALTER TABLE "new_Site" RENAME TO "Site";

PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
