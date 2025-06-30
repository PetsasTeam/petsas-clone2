/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostTag" DROP CONSTRAINT "PostTag_tagId_fkey";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "categoryId",
ADD COLUMN     "category" TEXT;

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "PostTag";

-- DropTable
DROP TABLE "Tag";
