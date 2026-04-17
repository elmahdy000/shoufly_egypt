import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Initialize database with seed data
 * This endpoint is called automatically on first access
 */
export async function GET(req: NextRequest) {
  try {
    // Check if database already has data
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      return NextResponse.json({ 
        status: "ok",
        message: "Database already initialized",
        users: userCount 
      });
    }

    console.log("[v0] Initializing database with seed data...");

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@shoofly.com",
        fullName: "أحمد محمد",
        passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1s2", // "password123" hashed
        role: "ADMIN",
        phone: "+201011111111",
        isVerified: true,
        isActive: true,
        walletBalance: 50000,
      },
    });

    // Create clients
    const clients = await Promise.all([
      prisma.user.create({
        data: {
          email: "client1@shoofly.com",
          fullName: "محمد علي",
          passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1s2",
          role: "CLIENT",
          phone: "+201012345678",
          isVerified: true,
          isActive: true,
          walletBalance: 8500,
        },
      }),
      prisma.user.create({
        data: {
          email: "client2@shoofly.com",
          fullName: "سارة أحمد",
          passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1s2",
          role: "CLIENT",
          phone: "+201023456789",
          isVerified: true,
          isActive: true,
          walletBalance: 12000,
        },
      }),
    ]);

    // Create vendors
    const vendors = await Promise.all([
      prisma.user.create({
        data: {
          email: "vendor1@shoofly.com",
          fullName: "شركة التقنية المتقدمة",
          passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1s2",
          role: "VENDOR",
          phone: "+201055555551",
          isVerified: true,
          isActive: true,
          walletBalance: 25000,
        },
      }),
      prisma.user.create({
        data: {
          email: "vendor2@shoofly.com",
          fullName: "أحمد للصيانة",
          passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1s2",
          role: "VENDOR",
          phone: "+201055555552",
          isVerified: true,
          isActive: true,
          walletBalance: 15000,
        },
      }),
      prisma.user.create({
        data: {
          email: "vendor3@shoofly.com",
          fullName: "محمد للخدمات المنزلية",
          passwordHash: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/1s2",
          role: "VENDOR",
          phone: "+201055555553",
          isVerified: false,
          isActive: true,
          walletBalance: 8000,
        },
      }),
    ]);

    // Create requests
    await Promise.all([
      prisma.request.create({
        data: {
          title: "طلب صيانة كمبيوتر محمول",
          description: "أحتاج لصيانة جهاز كمبيوتر محمول HP، المشكلة في البطارية",
          category: "تكنولوجيا",
          status: "OPEN_FOR_BIDDING",
          clientId: clients[0].id,
        },
      }),
      prisma.request.create({
        data: {
          title: "توصيل أثاث من المتجر للمنزل",
          description: "توصيل طقم أثاث غرفة نوم من المعرض للعنوان",
          category: "توصيل",
          status: "ORDER_PAID_PENDING_DELIVERY",
          clientId: clients[1].id,
        },
      }),
      prisma.request.create({
        data: {
          title: "تصميم موقع ويب احترافي",
          description: "تصميم موقع تجاري للمتجر الإلكتروني",
          category: "تصميم",
          status: "BIDS_RECEIVED",
          clientId: clients[0].id,
        },
      }),
      prisma.request.create({
        data: {
          title: "إصلاح أنابيب المياه",
          description: "تسريب في أنابيب المياه تحت الحوض",
          category: "سباكة",
          status: "CLOSED_SUCCESS",
          clientId: clients[1].id,
        },
      }),
      prisma.request.create({
        data: {
          title: "تنظيف شامل للمنزل",
          description: "تنظيف عميق للمنزل بالكامل",
          category: "خدمات",
          status: "PENDING_ADMIN_REVISION",
          clientId: clients[0].id,
        },
      }),
    ]);

    console.log("[v0] Database initialized successfully!");

    return NextResponse.json({
      status: "initialized",
      message: "Database initialized with seed data",
      admin,
      clients: clients.length,
      vendors: vendors.length,
    });
  } catch (error) {
    console.error("[v0] Database initialization error:", error);
    return NextResponse.json(
      { 
        error: "Failed to initialize database",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
