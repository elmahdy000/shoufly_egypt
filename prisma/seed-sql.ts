import "dotenv/config";
import postgres from "postgres";
import bcrypt from "bcryptjs";

const connection = postgres(process.env.DATABASE_URL || "");

async function seed() {
  console.log("🌱 Seeding database with SQL...");

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 10);

    // Clear existing data  
    await connection`DELETE FROM "Notification"`;
    await connection`DELETE FROM "Transaction"`;
    await connection`DELETE FROM "DeliveryTracking"`;
    await connection`DELETE FROM "BidImage"`;
    await connection`DELETE FROM "Bid"`;
    await connection`DELETE FROM "RequestImage"`;
    await connection`DELETE FROM "Request"`;
    await connection`DELETE FROM "VendorCategory"`;
    await connection`DELETE FROM "Category"`;
    await connection`DELETE FROM "PlatformSetting"`;
    await connection`DELETE FROM "User"`;

    console.log("✓ Cleared existing data");

    // Create Users
    const adminId = crypto.randomUUID();
    const client1Id = crypto.randomUUID();
    const client2Id = crypto.randomUUID();
    const vendor1Id = crypto.randomUUID();
    const vendor2Id = crypto.randomUUID();

    await connection`INSERT INTO "User" (id, "fullName", email, password, phone, role, "isActive", "walletBalance", "createdAt", "updatedAt")
      VALUES 
      (${adminId}, 'Admin User', 'admin@shoofly.com', ${hashedPassword}, '+20100000001', 'ADMIN', true, 10000, NOW(), NOW()),
      (${client1Id}, 'Ahmed Hassan', 'client1@shoofly.com', ${hashedPassword}, '+20100000002', 'CLIENT', true, 5000, NOW(), NOW()),
      (${client2Id}, 'Fatima ElSawy', 'client2@shoofly.com', ${hashedPassword}, '+20100000003', 'CLIENT', true, 3000, NOW(), NOW()),
      (${vendor1Id}, 'Mohammed ElAmin', 'vendor1@shoofly.com', ${hashedPassword}, '+20100000004', 'VENDOR', true, 2500, NOW(), NOW()),
      (${vendor2Id}, 'Sara ElNaggar', 'vendor2@shoofly.com', ${hashedPassword}, '+20100000005', 'VENDOR', true, 1800, NOW(), NOW())
    `;

    console.log("✓ Created 5 users");

    // Create Categories
    const cat1Id = crypto.randomUUID();
    const cat2Id = crypto.randomUUID();
    const cat3Id = crypto.randomUUID();
    const cat4Id = crypto.randomUUID();
    const cat5Id = crypto.randomUUID();

    await connection`INSERT INTO "Category" (id, name, slug, "createdAt")
      VALUES 
      (${cat1Id}, 'Home Cleaning', 'home-cleaning', NOW()),
      (${cat2Id}, 'Plumbing', 'plumbing', NOW()),
      (${cat3Id}, 'Electrical', 'electrical', NOW()),
      (${cat4Id}, 'Painting', 'painting', NOW()),
      (${cat5Id}, 'Carpentry', 'carpentry', NOW())
    `;

    console.log("✓ Created 5 categories");

    // Link vendors to categories
    await connection`INSERT INTO "VendorCategory" (id, "vendorId", "categoryId")
      VALUES 
      (${crypto.randomUUID()}, ${vendor1Id}, ${cat1Id}),
      (${crypto.randomUUID()}, ${vendor1Id}, ${cat2Id}),
      (${crypto.randomUUID()}, ${vendor2Id}, ${cat3Id}),
      (${crypto.randomUUID()}, ${vendor2Id}, ${cat4Id})
    `;

    console.log("✓ Linked vendors to categories");

    // Create Requests
    const req1Id = crypto.randomUUID();
    const req2Id = crypto.randomUUID();

    await connection`INSERT INTO "Request" (id, "clientId", title, description, "categoryId", "locationLatitude", "locationLongitude", "locationName", status, "qrCode", "createdAt", "updatedAt")
      VALUES 
      (${req1Id}, ${client1Id}, 'Kitchen Deep Clean', 'Need professional kitchen cleaning', ${cat1Id}, 30.0444, 31.2357, 'Cairo', 'OPEN_FOR_BIDDING', 'QR001', NOW(), NOW()),
      (${req2Id}, ${client2Id}, 'Fix Leaking Tap', 'Bathroom tap is leaking water', ${cat2Id}, 30.0500, 31.2400, 'Giza', 'OPEN_FOR_BIDDING', 'QR002', NOW(), NOW())
    `;

    console.log("✓ Created 2 sample requests");

    // Create Bids
    const bid1Id = crypto.randomUUID();
    const bid2Id = crypto.randomUUID();
    const bid3Id = crypto.randomUUID();

    await connection`INSERT INTO "Bid" (id, "requestId", "vendorId", description, "netPrice", "clientPrice", status, "createdAt", "updatedAt")
      VALUES 
      (${bid1Id}, ${req1Id}, ${vendor1Id}, 'Professional kitchen cleaning service', 500, 500, 'PENDING', NOW(), NOW()),
      (${bid2Id}, ${req1Id}, ${vendor2Id}, 'Deep cleaning with disinfection', 600, 650, 'PENDING', NOW(), NOW()),
      (${bid3Id}, ${req2Id}, ${vendor1Id}, 'Quick tap repair', 150, 150, 'PENDING', NOW(), NOW())
    `;

    console.log("✓ Created 3 sample bids");

    // Create Platform Settings
    const settingsId = crypto.randomUUID();
    await connection`INSERT INTO "PlatformSetting" (id, "commissionPercent", "minVendorMatchCount", "createdAt", "updatedAt")
      VALUES 
      (${settingsId}, 15, 3, NOW(), NOW())
    `;

    console.log("✓ Created platform settings");

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

seed();
