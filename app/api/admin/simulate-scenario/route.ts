import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  try {
    console.log('🚀 Starting API-based Scenario Simulation...');

    const password = await bcrypt.hash('password123', 10);

    // 1. Create Scenario Client
    const client = await prisma.user.upsert({
      where: { email: 'sim_client@shoofly.com' },
      update: { walletBalance: 5000 },
      create: { 
        email: 'sim_client@shoofly.com', 
        fullName: 'عميل التجربة', 
        phone: '01011112222', 
        password, 
        role: 'CLIENT', 
        isActive: true,
        walletBalance: 5000
      }
    });

    // 2. Create Scenario Vendor
    const vendor = await prisma.user.upsert({
      where: { email: 'sim_vendor@shoofly.com' },
      update: { 
        verificationStatus: 'APPROVED',
        isVerified: true,
        latitude: 30.0626,
        longitude: 31.2497 
      },
      create: { 
        email: 'sim_vendor@shoofly.com', 
        fullName: 'مورد التجربة السريع', 
        phone: '01033334444', 
        password, 
        role: 'VENDOR', 
        isActive: true,
        isVerified: true,
        verificationStatus: 'APPROVED',
        latitude: 30.0626,
        longitude: 31.2497,
        vendorAddress: 'رمسيس، القاهرة'
      }
    });

    // 3. Create Scenario Rider
    const rider = await prisma.user.upsert({
      where: { email: 'sim_rider@shoofly.com' },
      update: { isActive: true },
      create: { 
        email: 'sim_rider@shoofly.com', 
        fullName: 'طيار التجربة', 
        phone: '01055556666', 
        password, 
        role: 'DELIVERY', 
        isActive: true,
        isVerified: true,
        vehicleType: 'MOTORCYCLE'
      }
    });

    // 4. Create Category if missing
    const cat = await prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: { name: 'إلكترونيات', slug: 'electronics', type: 'PRODUCT', nameAr: 'إلكترونيات' }
    });

    // 5. Create Request in 'ORDER_PAID_PENDING_DELIVERY'
    const request = await prisma.request.create({
      data: {
        title: 'شراء شاحن أصلي لابتوب ديل',
        description: 'محتاج شاحن ٩٠ وات لابتوب ديل لود بريسيجن',
        clientId: client.id,
        categoryId: cat.id,
        latitude: 30.0444,
        longitude: 31.2357,
        address: 'وسط البلد، القاهرة',
        deliveryPhone: '01011112222',
        status: 'ORDER_PAID_PENDING_DELIVERY',
        assignedDeliveryAgentId: rider.id
      }
    });

    // 6. Create Delivery Tracking simulation
    await prisma.deliveryTracking.createMany({
      data: [
        {
          requestId: request.id,
          status: 'ORDER_PLACED',
          createdAt: new Date(Date.now() - 3600000)
        },
        {
          requestId: request.id,
          status: 'IN_TRANSIT',
          latitude: 30.0626,
          longitude: 31.2497,
          createdAt: new Date(Date.now() - 1800000)
        },
        {
          requestId: request.id,
          status: 'OUT_FOR_DELIVERY',
          latitude: 30.0544,
          longitude: 31.2427,
          createdAt: new Date()
        }
      ]
    });

    return NextResponse.json({ 
        success: true, 
        message: 'Scenario simulated successfully',
        requestId: request.id,
        credentials: {
            client: 'sim_client@shoofly.com',
            vendor: 'sim_vendor@shoofly.com',
            rider: 'sim_rider@shoofly.com',
            password: 'password123'
        }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
