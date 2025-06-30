/*
  Warnings:

  - A unique constraint covering the columns `[slugRu]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "contentRu" TEXT,
ADD COLUMN     "publishedRu" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "slugRu" TEXT,
ADD COLUMN     "summary" TEXT,
ADD COLUMN     "summaryRu" TEXT,
ADD COLUMN     "titleRu" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Post_slugRu_key" ON "Post"("slugRu");
