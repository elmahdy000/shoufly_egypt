#!/usr/bin/env node

/**
 * Database setup script
 * Runs Prisma migrations and seeds sample data
 */

const { execSync } = require("child_process");

async function main() {
  console.log("🗄️  Initializing database...\n");

  try {
    // Check environment
    console.log("✓ Checking environment variables...");
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable not set");
    }

    // Run migrations
    console.log("\n✓ Running Prisma migrations...");
    execSync("prisma migrate deploy", { stdio: "inherit" });

    // Seed data
    console.log("\n✓ Seeding database...");
    execSync("prisma db seed", { stdio: "inherit" });

    console.log("\n✅ Database setup complete!\n");
  } catch (error) {
    console.error("\n❌ Database setup failed:", error.message);
    process.exit(1);
  }
}

main();
