-- CreateEnum
CREATE TYPE "AdminPeriod" AS ENUM ('TRUMP_1', 'TRUMP_2', 'OTHER');

-- CreateEnum
CREATE TYPE "StrengthRating" AS ENUM ('weak', 'moderate', 'strong');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "admin_period" "AdminPeriod" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "color" VARCHAR(7) NOT NULL DEFAULT '#6B7280',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tags" (
    "event_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,

    CONSTRAINT "event_tags_pkey" PRIMARY KEY ("event_id","tag_id")
);

-- CreateTable
CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "publication_id" TEXT,
    "url" VARCHAR(2048) NOT NULL,
    "article_title" VARCHAR(500),
    "bias_rating" SMALLINT NOT NULL,
    "date_accessed" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "publications" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "domain" VARCHAR(253) NOT NULL,
    "default_bias" SMALLINT NOT NULL,
    "credibility" VARCHAR(20),

    CONSTRAINT "publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_narratives" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "narrative_text" TEXT NOT NULL,
    "admin_strength" "StrengthRating" NOT NULL,
    "concern_strength" "StrengthRating" NOT NULL,
    "source_refs" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counter_narratives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_event_date_idx" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "events_admin_period_idx" ON "events"("admin_period");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "sources_event_id_idx" ON "sources"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "publications_name_key" ON "publications"("name");

-- CreateIndex
CREATE UNIQUE INDEX "publications_domain_key" ON "publications"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "counter_narratives_event_id_key" ON "counter_narratives"("event_id");

-- AddForeignKey
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tags" ADD CONSTRAINT "event_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sources" ADD CONSTRAINT "sources_publication_id_fkey" FOREIGN KEY ("publication_id") REFERENCES "publications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_narratives" ADD CONSTRAINT "counter_narratives_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
