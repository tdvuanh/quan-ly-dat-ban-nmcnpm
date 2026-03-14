/*
  Warnings:

  - The `table_id` column on the `bookings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "bookings" DROP CONSTRAINT "bookings_user_id_fkey";

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL,
DROP COLUMN "table_id",
ADD COLUMN     "table_id" BIGINT;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
