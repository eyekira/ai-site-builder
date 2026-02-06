-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "previewToken" TEXT,
    "themeJson" TEXT,
    "ownerId" INTEGER NOT NULL,
    "placeId" TEXT,
    CONSTRAINT "Site_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Site_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Place" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "hoursJson" TEXT,
    "lat" REAL,
    "lng" REAL
);

-- CreateTable
CREATE TABLE "Section" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "siteId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Section_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");

-- CreateIndex
CREATE INDEX "Section_siteId_order_idx" ON "Section"("siteId", "order");
