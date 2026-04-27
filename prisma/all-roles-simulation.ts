import { prisma } from "../lib/prisma";
import { createRequest } from "../lib/services/requests/create-request";
import { reviewRequest } from "../lib/services/admin/review-request";
import { createBid } from "../lib/services/bids/create-bid";
import { forwardOffer } from "../lib/services/admin/forward-offer";
import { acceptOffer } from "../lib/services/offers/accept-offer";
import { payRequest } from "../lib/services/payments/pay-request";
import { acceptDeliveryTask } from "../lib/services/delivery/accept-delivery-task";
import { completeDeliveryAgent } from "../lib/services/delivery/complete-delivery-agent";

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("🏙️  WELCOME TO SHOOFLY EGYPT: MASTER ROLE SIMULATION 2026");
  console.log("========================================================\n");

  // --- INITIALIZATION ---
  const actors = {
    admin: { email: "admin@shoofly.com" },
    client: { email: "ahmed@gmail.com" },
    vendorA: { email: "alex.store@shoofly.com" }, // Existing from seed
    vendorB: { email: "vendor.mega2@shoofly.com" }, // From mega seed
    vendorC: { email: "vendor.mega3@shoofly.com" },
    rider: { email: "hani.delivery@shoofly.com" }
  };

  const users: any = {};
  for (const [key, val] of Object.entries(actors)) {
    users[key] = await prisma.user.findUnique({ where: { email: val.email } });
    if (!users[key]) throw new Error(`Missing actor: ${key} (${val.email}). Ensure all seeds are run.`);
  }

  const category = await prisma.category.findFirst({ where: { parentId: { not: null } } });
  const gov = await prisma.governorate.findFirst();
  const city = await prisma.city.findFirst({ where: { governorateId: gov?.id } });

  console.log("🚀 INITIALIZING ACTORS...");
  console.log(`- 👑 Admin: ${users.admin.fullName}`);
  console.log(`- 👤 Client: ${users.client.fullName}`);
  console.log(`- 🏪 Vendors: ${users.vendorA.fullName}, ${users.vendorB.fullName}, ${users.vendorC.fullName}`);
  console.log(`- 🚚 Rider: ${users.rider.fullName}\n`);

  // --- PHASE 1: CLIENT STORY ---
  console.log("--- PHASE 1: THE CLIENT'S NEED ---");
  console.log(`[CLIENT] ${users.client.fullName} post a request for fixing a high-end device...`);
  const request = await createRequest(users.client.id, {
    title: "إصلاح عاجل: شاشة ماك بوك برو M2 كسر كامل",
    description: "الشاشة اتحط عليها حاجة تقيلة واتكسرت محتاج تغيير شاشة فوري بسعر معقول.",
    categoryId: category!.id,
    address: "التجمع الخامس، القاهرة",
    deliveryPhone: users.client.phone!,
    latitude: 30.0131,
    longitude: 31.4222,
    budget: 12000,
    governorateId: gov!.id,
    cityId: city!.id
  } as any);
  
  if (!request) {
    throw new Error("Failed to create request");
  }
  
  console.log(`📢 Request Posted! (Status: ${request.status})\n`);

  await sleep(1000);

  // --- PHASE 2: ADMIN STORY (MODERATION) ---
  console.log("--- PHASE 2: THE ADMIN'S EYES ---");
  console.log(`[ADMIN] ${users.admin.fullName} reviewing the request queue...`);
  console.log(`[ADMIN] Checking content for violations... All clear.`);
  await reviewRequest(request.id, "approve");
  console.log(`✅ Request Approved for Nationwide Bidding! (Status: OPEN_FOR_BIDDING)\n`);

  await sleep(1000);

  // --- PHASE 3: VENDOR COMPETITION ---
  console.log("--- PHASE 3: THE VENDOR WAR (COMPETITION) ---");
  
  console.log(`[VENDOR A] ${users.vendorA.fullName} placing a bid...`);
  const bidA = await createBid(users.vendorA.id, { requestId: request.id, description: "شاشة استيراد خلع توكيل، ضمان سنة.", netPrice: 8500 });
  
  console.log(`[VENDOR B] ${users.vendorB.fullName} placing a competitive bid...`);
  const bidB = await createBid(users.vendorB.id, { requestId: request.id, description: "شاشة جديدة متوافقة مع ضمان سنتين.", netPrice: 7800 });

  console.log(`[VENDOR C] ${users.vendorC.fullName} placing a high-end bid...`);
  const bidC = await createBid(users.vendorC.id, { requestId: request.id, description: "شاشة أصلية 100% متاحة الآن.", netPrice: 9500 });

  console.log(`📢 3 Vendors have placed bids. Request Status: BIDS_RECEIVED\n`);

  await sleep(1000);

  // --- PHASE 4: ADMIN CURATION ---
  console.log("--- PHASE 4: THE ADMIN CURATION ---");
  console.log(`[ADMIN] Selecting the most reliable offers for the client...`);
  await forwardOffer(bidA.id);
  await forwardOffer(bidB.id);
  console.log(`✅ Top 2 offers forwarded to ${users.client.fullName}. (Status: OFFERS_FORWARDED)\n`);

  await sleep(1000);

  // --- PHASE 5: CLIENT DECISION & PAYMENT ---
  console.log("--- PHASE 5: THE CLIENT DECISION ---");
  console.log(`[CLIENT] Comparing offers... choosing ${users.vendorB.fullName} for the better warranty.`);
  await acceptOffer(bidB.id, users.client.id);
  
  console.log(`[CLIENT] Proceeding to secure payment from wallet...`);
  // Top up client wallet for this big transaction
  await prisma.user.update({ where: { id: users.client.id }, data: { walletBalance: 15000 } });
  const payment: any = await payRequest(request.id, users.client.id);
  console.log(`💰 Payment Successful! Amount: ${payment.amountPaid} EGP`);
  console.log(`🔑 Secure Delivery QR Generated: ${payment.qrCode}\n`);

  await sleep(1000);

  // --- PHASE 6: LOGISTICS & DELIVERY ---
  console.log("--- PHASE 6: THE DELIVERY HERO ---");
  console.log(`[RIDER] ${users.rider.fullName} spotted a high-value delivery task near Maadi.`);
  await acceptDeliveryTask(request.id, users.rider.id);
  console.log(`🚚 Rider on the move! Status: OUT_FOR_DELIVERY`);

  console.log(`[RIDER] Arrived at ${users.client.fullName}'s location.`);
  console.log(`[RIDER] Waiting for QR code confirmation...`);
  
  await sleep(1500);

  console.log(`[CLIENT] Providing QR code for safe receipt...`);
  const completion: any = await completeDeliveryAgent(request.id, users.rider.id, payment.qrCode);
  console.log(`🏁 ORDER CLOSED! Final Status: ${completion.finalRequestStatus}\n`);

  // --- PHASE 7: FINANCIAL SETTLEMENT ---
  console.log("--- PHASE 7: THE REWARDS ---");
  const finalVendor = await prisma.user.findUnique({ where: { id: users.vendorB.id } });
  const finalRider = await prisma.user.findUnique({ where: { id: users.rider.id } });
  const finalAdminBalance = (await prisma.user.findUnique({ where: { id: users.admin.id } }))?.walletBalance;

  console.log(`🏪 Vendor ${users.vendorB.fullName} Balance: ${finalVendor?.walletBalance} EGP (Payout Received)`);
  console.log(`🚚 Rider ${users.rider.fullName} Balance: ${finalRider?.walletBalance} EGP (Delivery Fee Received)`);
  console.log(`👑 Admin Commission Collected: ${completion.adminCommission} EGP\n`);

  console.log("🏆 SIMULATION SUCCESS: THE CIRCLE OF SERVICE IS COMPLETE.");
}

main()
  .catch((e) => {
    console.error("❌ Simulation Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
