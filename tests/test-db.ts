import { PrismaClient } from "../app/generated/prisma";


import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, fullName: true, role: true } });
    console.log(`\nFound ${users.length} users:`);

    users.forEach(u => console.log(`- [#${u.id}] ${u.fullName} (${u.role})`));

    const categories = await prisma.category.findMany();
    console.log(`\nFound ${categories.length} categories:`);
    categories.forEach(c => console.log(`- [#${c.id}] ${c.name}`));


    console.log("\nSchema verification:");
    console.log("User model: working");
    console.log("Category model: working");
    console.log("Database connection: working");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error: ${message}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
