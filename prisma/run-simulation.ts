// @ts-nocheck
import { prisma } from "../lib/prisma";
import { createRequest } from "../lib/services/requests/create-request";
import { reviewRequest } from "../lib/services/admin/review-request";
import { acceptOffer } from "../lib/services/offers/accept-offer";
import { payRequest } from "../lib/services/payments/pay-request";
import { acceptDeliveryTask } from "../lib/services/delivery/accept-delivery-task";
import { completeDeliveryAgent } from "../lib/services/delivery/complete-delivery-agent";
import { createBid } from "../lib/services/bids/create-bid";
import { forwardOffer } from "../lib/services/admin/forward-offer";
import { CreateRequestInput } from "../lib/validations/request";

async function main() {
  console.log("🎭 Starting Full End-to-End Simulation...");

  // 1. Setup Users
  const client = await prisma.user.findUnique({ where: { email: "ahmed@gmail.com" } });
  const vendor = await prisma.user.findUnique({ where: { email: "alex.store@shoofly.com" } });
  const rider = await prisma.user.findUnique({ where: { email: "hani.delivery@shoofly.com" } });
  const admin = await prisma.user.findUnique({ where: { email: "admin@shoofly.com" } });
  const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
  const gov = await prisma.governorate.findFirst();
  const city = await prisma.city.findFirst({ where: { governorateId: gov?.id } });

  if (!client || !vendor || !rider || !admin || !category || !gov || !city) {
    throw new Error("Missing required seed data for simulation. Please run seed-production-egypt first.");
  }

  console.log(`👤 Simulation Actors: Client(${client.fullName}), Vendor(${vendor.fullName}), Rider(${rider.fullName})`);

  // --- STEP 1: CLIENT CREATES REQUEST ---
  console.log("\nStep 1: Client creating a new request...");
  const requestInput: CreateRequestInput = {
    title: "سيميوليشن: إصلاح موبايل سامسونج S22",
    description: "البطارية بتخلص بسرعة جداً ومحتاج تغيير بطارية أصلية.",
    categoryId: category.id,
    address: "المعادي، القاهرة",
    deliveryPhone: client.phone!,
    latitude: 29.9623,
    longitude: 31.2522,
    budget: 1500,
    governorateId: gov.id,
    cityId: city.id
  };
  const request = await createRequest(client.id, requestInput);
  console.log(`✅ Request created (ID: ${request.id}, Status: ${request.status})`);

  // --- STEP 2: ADMIN REVIEWS & APPROVES ---
  console.log("\nStep 2: Admin reviewing and approving request...");
  await reviewRequest(request.id, "approve");
  console.log(`✅ Request approved (Status: OPEN_FOR_BIDDING)`);

  // --- STEP 3: VENDOR PLACES BID ---
  console.log("\nStep 3: Vendor placing a bid via service...");
  const bid = await createBid(vendor.id, {
    requestId: request.id,
    description: "موجود بطارية أصلية وعليها ضمان 6 شهور، التركيب في ساعة.",
    netPrice: 900
  });
  console.log(`✅ Bid placed (ID: ${bid.id}, Request Status: BIDS_RECEIVED)`);

  // --- STEP 3.5: ADMIN FORWARDS OFFER ---
  console.log("\nStep 3.5: Admin forwarding the bid to the client...");
  await forwardOffer(bid.id);
  console.log(`✅ Bid forwarded (Bid Status: SELECTED, Request Status: OFFERS_FORWARDED)`);

  // --- STEP 4: CLIENT ACCEPTS BID ---
  console.log("\nStep 4: Client accepting the bid...");
  await acceptOffer(bid.id, client.id);
  console.log(`✅ Bid accepted (Bid Status: ACCEPTED_BY_CLIENT)`);

  // --- STEP 5: CLIENT PAYS (WALLET) ---
  console.log("\nStep 5: Client paying for the request...");
  // Ensure client has enough balance for simulation
  await prisma.user.update({ where: { id: client.id }, data: { walletBalance: 5000 } });
  const payment: any = await payRequest(request.id, client.id);
  console.log(`✅ Payment completed (Status: ORDER_PAID_PENDING_DELIVERY)`);
  console.log(`🔑 Receipt QR Code: ${payment.qrCode}`);

  // --- STEP 6: RIDER ACCEPTS TASK ---
  console.log("\nStep 6: Rider accepting the delivery task...");
  await acceptDeliveryTask(request.id, rider.id);
  console.log(`✅ Rider assigned (Rider: ${rider.fullName})`);

  // --- STEP 7: RIDER COMPLETES DELIVERY (WITH QR) ---
  console.log("\nStep 7: Rider completing delivery using QR code...");
  const qrCode = payment.qrCode;
  if (!qrCode) throw new Error("QR Code missing from payment result");
  
  const completion: any = await completeDeliveryAgent(request.id, rider.id, qrCode);
  console.log(`✅ Delivery completed and settled! (Final Status: ${completion.finalRequestStatus})`);

  // --- FINAL CHECK ---
  const finalVendor = await prisma.user.findUnique({ where: { id: vendor.id } });
  const finalRider = await prisma.user.findUnique({ where: { id: rider.id } });
  console.log("\n--- SIMULATION SUCCESS ---");
  console.log(`💰 Vendor Payout Received: ${finalVendor?.walletBalance} EGP`);
  console.log(`💰 Rider Delivery Fee Received: ${finalRider?.walletBalance} EGP`);
}

main()
  .catch((e) => {
    console.error("❌ Simulation Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
