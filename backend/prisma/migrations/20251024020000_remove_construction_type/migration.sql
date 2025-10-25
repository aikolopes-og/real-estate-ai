-- Remove CONSTRUCTION from CompanyType enum
ALTER TYPE "CompanyType" RENAME TO "CompanyType_old";
CREATE TYPE "CompanyType" AS ENUM ('BROKER');
ALTER TABLE "companies" ALTER COLUMN "type" TYPE "CompanyType" USING ("type"::text::"CompanyType");
DROP TYPE "CompanyType_old";
