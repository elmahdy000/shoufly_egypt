-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'VENDOR', 'ADMIN', 'DELIVERY');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING_ADMIN_REVISION', 'OPEN_FOR_BIDDING', 'BIDS_RECEIVED', 'OFFERS_FORWARDED', 'ORDER_PAID_PENDING_DELIVERY', 'CLOSED_SUCCESS', 'CLOSED_CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'SELECTED', 'ACCEPTED_BY_CLIENT', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('ORDER_PLACED', 'VENDOR_PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'IN_TRANSIT', 'DELIVERED', 'FAILED_DELIVERY', 'RETURNED');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ESCROW_DEPOSIT', 'VENDOR_PAYOUT', 'DELIVERY_PAYOUT', 'ADMIN_COMMISSION', 'REFUND', 'WITHDRAWAL', 'WALLET_TOPUP');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_REQUEST', 'NEW_BID', 'OFFER_RECEIVED', 'BID_ACCEPTED', 'DELIVERY_UPDATE', 'DELIVERY_FAILED', 'PAYMENT_RECEIVED', 'REFUND_ISSUED', 'REQUEST_DISPATCHED', 'WALLET_TOPUP', 'WITHDRAWAL_APPROVED', 'WITHDRAWAL_REJECTED', 'WITHDRAWAL_REQUESTED', 'REQUEST_CANCELLED');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('SERVICE', 'PRODUCT', 'DIGITAL');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED');

-- CreateTable Governorate
CREATE TABLE "Governorate" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE
);

-- CreateTable City
CREATE TABLE "City" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "governorateId" INTEGER NOT NULL,
  CONSTRAINT "City_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable User
CREATE TABLE "User" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "phone" TEXT,
  "role" "UserRole" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  "walletBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "fcmToken" TEXT,
  "cityId" INTEGER,
  "governorateId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "User_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable Category
CREATE TABLE "Category" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "parentId" INTEGER,
  "requiresBrand" BOOLEAN NOT NULL DEFAULT false,
  "brandType" TEXT,
  "type" "CategoryType" NOT NULL DEFAULT 'SERVICE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable Brand
CREATE TABLE "Brand" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL,
  "logo" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable VendorBrand
CREATE TABLE "VendorBrand" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "vendorId" INTEGER NOT NULL,
  "brandId" INTEGER NOT NULL,
  CONSTRAINT "VendorBrand_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VendorBrand_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable VendorCategory
CREATE TABLE "VendorCategory" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "vendorId" INTEGER NOT NULL,
  "categoryId" INTEGER NOT NULL,
  CONSTRAINT "VendorCategory_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "VendorCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable Request
CREATE TABLE "Request" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "clientId" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "categoryId" INTEGER NOT NULL,
  "brandId" INTEGER,
  "address" TEXT NOT NULL,
  "latitude" DECIMAL(10,7) NOT NULL,
  "longitude" DECIMAL(10,7) NOT NULL,
  "deliveryPhone" TEXT NOT NULL,
  "notes" TEXT,
  "status" "RequestStatus" NOT NULL DEFAULT 'PENDING_ADMIN_REVISION',
  "selectedBidId" INTEGER UNIQUE,
  "qrCode" TEXT,
  "assignedDeliveryAgentId" INTEGER,
  "cityId" INTEGER,
  "governorateId" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Request_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Request_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Request_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Request_assignedDeliveryAgentId_fkey" FOREIGN KEY ("assignedDeliveryAgentId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Request_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Request_governorateId_fkey" FOREIGN KEY ("governorateId") REFERENCES "Governorate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable RequestImage
CREATE TABLE "RequestImage" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "requestId" INTEGER NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RequestImage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable Bid
CREATE TABLE "Bid" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "requestId" INTEGER NOT NULL,
  "vendorId" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "netPrice" DECIMAL(12,2) NOT NULL,
  "clientPrice" DECIMAL(12,2) NOT NULL,
  "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
  "adminNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Bid_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Bid_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable BidImage
CREATE TABLE "BidImage" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "bidId" INTEGER NOT NULL,
  "filePath" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BidImage_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable DeliveryTracking
CREATE TABLE "DeliveryTracking" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "requestId" INTEGER NOT NULL,
  "status" "DeliveryStatus" NOT NULL,
  "latitude" DECIMAL(10,7),
  "longitude" DECIMAL(10,7),
  "speed" DECIMAL(5,2),
  "note" TEXT,
  "locationText" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliveryTracking_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable Transaction
CREATE TABLE "Transaction" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "requestId" INTEGER,
  "amount" DECIMAL(12,2) NOT NULL,
  "type" "TransactionType" NOT NULL,
  "description" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Transaction_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable Notification
CREATE TABLE "Notification" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "requestId" INTEGER,
  "metadata" JSONB,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Notification_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable ChatMessage
CREATE TABLE "ChatMessage" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "senderId" INTEGER NOT NULL,
  "receiverId" INTEGER NOT NULL,
  "content" TEXT NOT NULL,
  "requestId" INTEGER,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ChatMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable WithdrawalRequest
CREATE TABLE "WithdrawalRequest" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "vendorId" INTEGER NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
  "reviewNote" TEXT,
  "reviewedById" INTEGER,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WithdrawalRequest_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "WithdrawalRequest_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable PlatformSetting
CREATE TABLE "PlatformSetting" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "commissionPercent" DECIMAL(5,2) NOT NULL DEFAULT 15,
  "minVendorMatchCount" INTEGER NOT NULL DEFAULT 3,
  "initialRadiusKm" INTEGER NOT NULL DEFAULT 5,
  "maxRadiusKm" INTEGER NOT NULL DEFAULT 50,
  "radiusExpansionStepKm" INTEGER NOT NULL DEFAULT 5,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable Review
CREATE TABLE "Review" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "requestId" INTEGER NOT NULL UNIQUE,
  "reviewerId" INTEGER NOT NULL,
  "reviewedId" INTEGER NOT NULL,
  "rating" INTEGER NOT NULL,
  "comment" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Review_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Review_reviewedId_fkey" FOREIGN KEY ("reviewedId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable Complaint
CREATE TABLE "Complaint" (
  "id" SERIAL NOT NULL PRIMARY KEY,
  "requestId" INTEGER NOT NULL,
  "userId" INTEGER NOT NULL,
  "reportedUserId" INTEGER,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "ComplaintStatus" NOT NULL DEFAULT 'OPEN',
  "resolution" TEXT,
  "resolvedById" INTEGER,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Complaint_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Complaint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Complaint_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Complaint_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "City_governorateId_idx" ON "City"("governorateId");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");
CREATE INDEX "Category_slug_idx" ON "Category"("slug");
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");
CREATE INDEX "Category_brandType_idx" ON "Category"("brandType");
CREATE INDEX "Category_type_idx" ON "Category"("type");
CREATE INDEX "Brand_type_idx" ON "Brand"("type");
CREATE INDEX "Brand_slug_idx" ON "Brand"("slug");
CREATE UNIQUE INDEX "VendorBrand_vendorId_brandId_key" ON "VendorBrand"("vendorId", "brandId");
CREATE INDEX "VendorBrand_vendorId_idx" ON "VendorBrand"("vendorId");
CREATE INDEX "VendorBrand_brandId_idx" ON "VendorBrand"("brandId");
CREATE UNIQUE INDEX "VendorCategory_vendorId_categoryId_key" ON "VendorCategory"("vendorId", "categoryId");
CREATE INDEX "VendorCategory_vendorId_idx" ON "VendorCategory"("vendorId");
CREATE INDEX "VendorCategory_categoryId_idx" ON "VendorCategory"("categoryId");
CREATE INDEX "Request_clientId_idx" ON "Request"("clientId");
CREATE INDEX "Request_categoryId_idx" ON "Request"("categoryId");
CREATE INDEX "Request_brandId_idx" ON "Request"("brandId");
CREATE INDEX "Request_status_idx" ON "Request"("status");
CREATE INDEX "Request_assignedDeliveryAgentId_idx" ON "Request"("assignedDeliveryAgentId");
CREATE INDEX "Request_createdAt_idx" ON "Request"("createdAt");
CREATE INDEX "RequestImage_requestId_idx" ON "RequestImage"("requestId");
CREATE UNIQUE INDEX "Bid_requestId_vendorId_key" ON "Bid"("requestId", "vendorId");
CREATE INDEX "Bid_requestId_idx" ON "Bid"("requestId");
CREATE INDEX "Bid_vendorId_idx" ON "Bid"("vendorId");
CREATE INDEX "Bid_status_idx" ON "Bid"("status");
CREATE INDEX "Bid_createdAt_idx" ON "Bid"("createdAt");
CREATE INDEX "BidImage_bidId_idx" ON "BidImage"("bidId");
CREATE INDEX "DeliveryTracking_requestId_idx" ON "DeliveryTracking"("requestId");
CREATE INDEX "DeliveryTracking_status_idx" ON "DeliveryTracking"("status");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");
CREATE INDEX "ChatMessage_receiverId_idx" ON "ChatMessage"("receiverId");
CREATE INDEX "ChatMessage_createdAt_idx" ON "ChatMessage"("createdAt");
CREATE INDEX "WithdrawalRequest_vendorId_idx" ON "WithdrawalRequest"("vendorId");
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");
CREATE INDEX "WithdrawalRequest_reviewedById_idx" ON "WithdrawalRequest"("reviewedById");
CREATE INDEX "WithdrawalRequest_createdAt_idx" ON "WithdrawalRequest"("createdAt");
CREATE INDEX "Review_reviewedId_idx" ON "Review"("reviewedId");
CREATE INDEX "Complaint_requestId_idx" ON "Complaint"("requestId");
CREATE INDEX "Complaint_userId_idx" ON "Complaint"("userId");
CREATE INDEX "Complaint_reportedUserId_idx" ON "Complaint"("reportedUserId");
CREATE INDEX "Complaint_status_idx" ON "Complaint"("status");
