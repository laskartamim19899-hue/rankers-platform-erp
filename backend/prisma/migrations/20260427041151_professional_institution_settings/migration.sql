-- AlterTable
ALTER TABLE "InstitutionSettings" ADD COLUMN "address" TEXT DEFAULT 'Main Campus, City';
ALTER TABLE "InstitutionSettings" ADD COLUMN "email" TEXT DEFAULT 'info@rankersplatform.com';
ALTER TABLE "InstitutionSettings" ADD COLUMN "gstNumber" TEXT;
ALTER TABLE "InstitutionSettings" ADD COLUMN "phone" TEXT DEFAULT '+91 00000 00000';
ALTER TABLE "InstitutionSettings" ADD COLUMN "principalName" TEXT;
ALTER TABLE "InstitutionSettings" ADD COLUMN "tagline" TEXT DEFAULT 'Empowering Future Leaders';
ALTER TABLE "InstitutionSettings" ADD COLUMN "website" TEXT DEFAULT 'www.rankersplatform.com';
