-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE INDEX "bookings_table_id_idx" ON "bookings"("table_id");
