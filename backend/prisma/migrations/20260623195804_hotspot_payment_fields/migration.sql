-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "macAddress" TEXT,
ADD COLUMN     "packageId" TEXT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
