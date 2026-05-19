/*
  Warnings:

  - You are about to drop the column `address` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Contact` table. All the data in the column will be lost.
  - The primary key for the `_ProjectMembers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `AutomationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Communication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Integration` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Invoice` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[A,B]` on the table `_ProjectMembers` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Communication" DROP CONSTRAINT "Communication_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Communication" DROP CONSTRAINT "Communication_userId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_contactId_fkey";

-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropIndex
DROP INDEX "Contact_company_idx";

-- DropIndex
DROP INDEX "Contact_country_idx";

-- DropIndex
DROP INDEX "Deal_expectedCloseDate_idx";

-- DropIndex
DROP INDEX "Task_dueDate_idx";

-- DropIndex
DROP INDEX "Task_priority_idx";

-- DropIndex
DROP INDEX "User_isActive_idx";

-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "contactId" TEXT;

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "address",
DROP COLUMN "city",
DROP COLUMN "postalCode",
DROP COLUMN "state",
DROP COLUMN "website";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- AlterTable
ALTER TABLE "_ProjectMembers" DROP CONSTRAINT "_ProjectMembers_AB_pkey";

-- DropTable
DROP TABLE "AutomationRule";

-- DropTable
DROP TABLE "Communication";

-- DropTable
DROP TABLE "File";

-- DropTable
DROP TABLE "Integration";

-- DropTable
DROP TABLE "Invoice";

-- DropTable
DROP TABLE "Milestone";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamMember";

-- DropEnum
DROP TYPE "CommunicationType";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectMembers_AB_unique" ON "_ProjectMembers"("A", "B");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
