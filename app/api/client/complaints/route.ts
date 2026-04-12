import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, requireUser } from '@/lib/auth';
import { createComplaint } from '@/lib/services/complaints/create-complaint';
import { z } from 'zod';

const complaintSchema = z.object({
  requestId: z.number(),
  subject: z.string().min(3),
  description: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req.headers);
    requireUser(user);

    const body = await req.json();
    const data = complaintSchema.parse(body);

    const complaint = await createComplaint({
      ...data,
      userId: user.id,
    });

    return NextResponse.json(complaint);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
