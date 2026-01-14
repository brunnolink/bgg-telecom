/*
  Warnings:

  - Added the required column `client_name` to the `tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "client_name" TEXT NOT NULL;
