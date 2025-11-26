/*
  Warnings:

  - You are about to drop the column `source_refs` on the `counter_narratives` table. All the data in the column will be lost.
  - The `admin_strength` column on the `counter_narratives` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ClaimCategory" AS ENUM ('FACTUAL_ASSERTION', 'OPINION_ANALYSIS', 'SPECULATION');

-- AlterTable
ALTER TABLE "counter_narratives" DROP COLUMN "source_refs",
DROP COLUMN "admin_strength",
ADD COLUMN     "admin_strength" TEXT,
ALTER COLUMN "concern_strength" DROP NOT NULL;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "concern_level" "StrengthRating";

-- AlterTable
ALTER TABLE "sources" ADD COLUMN     "counter_narrative_id" TEXT,
ALTER COLUMN "event_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "normalized_domain" VARCHAR(253) NOT NULL,
    "total_sources" INTEGER NOT NULL DEFAULT 0,
    "avg_bias_rating" DECIMAL(4,2),
    "usage_frequency" INTEGER NOT NULL DEFAULT 0,
    "first_seen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL,
    "source_id" TEXT NOT NULL,
    "claim_text" TEXT NOT NULL,
    "category" "ClaimCategory" NOT NULL,
    "confidence_score" DECIMAL(3,2) NOT NULL,
    "extracted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domains_normalized_domain_key" ON "domains"("normalized_domain");

-- CreateIndex
CREATE INDEX "domains_normalized_domain_idx" ON "domains"("normalized_domain");

-- CreateIndex
CREATE INDEX "domains_last_used_idx" ON "domains"("last_used" DESC);

-- CreateIndex
CREATE INDEX "claims_source_id_idx" ON "claims"("source_id");

-- CreateIndex
CREATE INDEX "claims_category_idx" ON "claims"("category");

-- CreateIndex
CREATE INDEX "claims_confidence_score_idx" ON "claims"("confidence_score" DESC);

-- CreateIndex
CREATE INDEX "sources_counter_narrative_id_idx" ON "sources"("counter_narrative_id");

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_counter_narrative_id_fkey" FOREIGN KEY ("counter_narrative_id") REFERENCES "counter_narratives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claims" ADD CONSTRAINT "claims_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
