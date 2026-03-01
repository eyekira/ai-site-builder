-- Allow multiple users to create sites from the same place
DROP INDEX IF EXISTS "Site_placeId_key";
CREATE INDEX IF NOT EXISTS "Site_placeId_idx" ON "Site"("placeId");
