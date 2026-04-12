import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';

export async function createComplaint(params: {
  requestId: number;
  userId: number;
  subject: string;
  description: string;
}) {
  const { requestId, userId, subject, description } = params;

  // 1. Basic validation
  const request = await prisma.request.findUnique({
    where: { id: requestId }
  });

  if (!request) throw new Error('Request not found');
  
  // Ensure the user is related to this request (client, vendor, or agent)
  const isClient = request.clientId === userId;
  const isVendor = await prisma.bid.findFirst({ where: { requestId, vendorId: userId, status: 'ACCEPTED_BY_CLIENT' } });
  const isAgent = request.assignedDeliveryAgentId === userId;

  if (!isClient && !isVendor && !isAgent) {
    throw new Error('You are not authorized to file a complaint for this request');
  }

  // 2. Create Complaint
  const complaint = await prisma.complaint.create({
    data: {
      requestId,
      userId,
      subject,
      description,
      status: 'OPEN',
    }
  });

  logger.info('complaint.created', { complaintId: complaint.id, requestId, userId });

  // 3. Notify Admins
  // In production, send email/push to all admins
  
  return complaint;
}
