import assert from "node:assert/strict";
import "dotenv/config";

import { prisma } from "../lib/prisma";
import { createRequest } from "../lib/services/requests";
import { reviewRequest } from "../lib/services/admin";
import { createBid } from "../lib/services/bids";
import { forwardOffer } from "../lib/services/admin";
import { acceptOffer } from "../lib/services/offers";
import { payRequest } from "../lib/services/payments";
import { depositFunds, settleOrder } from "../lib/services/transactions";
import { requestWithdrawal, reviewWithdrawal } from "../lib/services/withdrawals";

function toTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

async function expectThrows(fn: () => Promise<unknown>, messagePart: string) {
  try {
    await fn();
    assert.fail(`Expected error containing "${messagePart}"`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    assert.ok(
      message.includes(messagePart),
      `Expected "${message}" to include "${messagePart}"`
    );
  }
}

type FlowContext = {
  requestId: number;
  bidId: number;
  clientId: number;
  vendorId: number;
  clientPrice: number;
  netPrice: number;
};

async function createFlow(params: {
  clientId: number;
  vendorId: number;
  categoryId: number;
  netPrice: number;
}): Promise<FlowContext> {
  const { clientId, vendorId, categoryId, netPrice } = params;
  const request = await createRequest(clientId, {
    title: `Transactions Scenario ${Date.now()}`,
    description: "Backend transactions scenario coverage",
    categoryId,
    address: "Cairo, Egypt",
    latitude: 30.0444,
    longitude: 31.2357,
    deliveryPhone: "01000000000",
  });

  assert.ok(request, "Request should be created");
  assert.equal(request.status, "PENDING_ADMIN_REVISION");

  await reviewRequest(request.id, "approve");
  const bid = await createBid(vendorId, {
    requestId: request.id,
    description: "Scenario bid",
    netPrice,
  });

  await forwardOffer(bid.id);
  await acceptOffer(bid.id, clientId);

  const refreshedBid = await prisma.bid.findUnique({
    where: { id: bid.id },
    select: { clientPrice: true, netPrice: true },
  });
  assert.ok(refreshedBid, "Bid should exist after acceptance");

  return {
    requestId: request.id,
    bidId: bid.id,
    clientId,
    vendorId,
    clientPrice: Number(refreshedBid.clientPrice),
    netPrice: Number(refreshedBid.netPrice),
  };
}

async function run() {
  console.log("Starting backend transactions full-scenarios test");

  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { id: 'asc' },
    select: { id: true, walletBalance: true },
  });
  const client = await prisma.user.findFirst({
    where: { role: "CLIENT", isActive: true },
    select: { id: true, walletBalance: true },
  });
  const vendor = await prisma.user.findFirst({
    where: { role: "VENDOR", isActive: true },
    select: { id: true, walletBalance: true },
  });
  const rider = await prisma.user.findFirst({
    where: { role: "DELIVERY", isActive: true },
    select: { id: true, walletBalance: true },
  });
  const category = await prisma.category.findFirst({
    where: { parentId: { not: null } },
    select: { id: true, name: true },
  });

  assert.ok(admin, "Active admin must exist");
  assert.ok(client, "Active client must exist");
  assert.ok(vendor, "Active vendor must exist");
  assert.ok(rider, "Active rider must exist");
  assert.ok(category, "Sub-category must exist");

  console.log("Scenario 1: deposit success + validation");
  await prisma.user.update({
    where: { id: client.id },
    data: { walletBalance: 100 },
  });
  const depositResult = await depositFunds(client.id, 123.45);
  const clientAfterDeposit = await prisma.user.findUnique({
    where: { id: client.id },
    select: { walletBalance: true },
  });
  assert.ok(clientAfterDeposit);
  assert.equal(toTwo(Number(clientAfterDeposit.walletBalance)), 223.45);
  const topupTx = await prisma.transaction.findUnique({
    where: { id: depositResult.transactionId },
    select: { type: true, amount: true, userId: true },
  });
  assert.ok(topupTx);
  assert.equal(topupTx.type, "WALLET_TOPUP");
  assert.equal(topupTx.userId, client.id);
  assert.equal(toTwo(Number(topupTx.amount)), 123.45);
  await expectThrows(() => depositFunds(client.id, 0), "positive");

  console.log("Scenario 2: pay request with insufficient wallet");
  const insufficientFlow = await createFlow({
    clientId: client.id,
    vendorId: vendor.id,
    categoryId: category.id,
    netPrice: 200,
  });
  await prisma.user.update({
    where: { id: client.id },
    data: { walletBalance: 0 },
  });
  const insufficientPayment = await payRequest(insufficientFlow.requestId, client.id);
  assert.equal(insufficientPayment.insufficientBalance, true);
  assert.ok(insufficientPayment.redirectUrl.includes(String(insufficientFlow.requestId)));
  // Assertions for topup creation are removed because pending topups
  // are now deferred until the payment gateway confirms the session to prevent database bloat.
  const requestAfterInsufficient = await prisma.request.findUnique({
    where: { id: insufficientFlow.requestId },
    select: { status: true },
  });
  assert.ok(requestAfterInsufficient);
  assert.equal(requestAfterInsufficient.status, "OFFERS_FORWARDED");

  console.log("Scenario 3: successful payment and escrow + double-payment guard");
  const paidFlow = await createFlow({
    clientId: client.id,
    vendorId: vendor.id,
    categoryId: category.id,
    netPrice: 100,
  });
  await prisma.user.update({
    where: { id: client.id },
    data: { walletBalance: 1000 },
  });
  const paymentResult = await payRequest(paidFlow.requestId, client.id);
  assert.equal(paymentResult.requestStatus, "ORDER_PAID_PENDING_DELIVERY");
  assert.equal(toTwo(paymentResult.amountPaid), toTwo(paidFlow.clientPrice));
  const clientAfterPayment = await prisma.user.findUnique({
    where: { id: client.id },
    select: { walletBalance: true },
  });
  assert.ok(clientAfterPayment);
  assert.equal(
    toTwo(Number(clientAfterPayment.walletBalance)),
    toTwo(1000 - paidFlow.clientPrice)
  );
  const escrowTx = await prisma.transaction.findFirst({
    where: {
      requestId: paidFlow.requestId,
      userId: client.id,
      type: "ESCROW_DEPOSIT",
    },
  });
  assert.ok(escrowTx, "Escrow deposit transaction should be created");
  await expectThrows(
    () => payRequest(paidFlow.requestId, client.id),
    "تم سداد قيمته"
  );

  console.log("Scenario 4: settlement with rider payout + idempotency guard");
  await prisma.request.update({
    where: { id: paidFlow.requestId },
    data: { assignedDeliveryAgentId: rider.id },
  });

  const adminBeforeSettle = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { walletBalance: true },
  });
  const vendorBeforeSettle = await prisma.user.findUnique({
    where: { id: vendor.id },
    select: { walletBalance: true },
  });
  const riderBeforeSettle = await prisma.user.findUnique({
    where: { id: rider.id },
    select: { walletBalance: true },
  });
  assert.ok(adminBeforeSettle && vendorBeforeSettle && riderBeforeSettle);

  const settleResult = await settleOrder(paidFlow.requestId);
  assert.equal(settleResult.finalRequestStatus, "CLOSED_SUCCESS");
  assert.equal(toTwo(settleResult.vendorPayout), toTwo(paidFlow.netPrice));

  const spread = toTwo(paidFlow.clientPrice - paidFlow.netPrice);
  const expectedRiderPayout = Math.min(20, toTwo(spread * 0.5));
  const expectedAdminCommission = toTwo(spread - expectedRiderPayout);
  assert.equal(toTwo(settleResult.adminCommission), expectedAdminCommission);

  const adminAfterSettle = await prisma.user.findUnique({
    where: { id: admin.id },
    select: { walletBalance: true },
  });
  const vendorAfterSettle = await prisma.user.findUnique({
    where: { id: vendor.id },
    select: { walletBalance: true },
  });
  const riderAfterSettle = await prisma.user.findUnique({
    where: { id: rider.id },
    select: { walletBalance: true },
  });
  assert.ok(adminAfterSettle && vendorAfterSettle && riderAfterSettle);
  assert.equal(
    toTwo(Number(vendorAfterSettle.walletBalance) - Number(vendorBeforeSettle.walletBalance)),
    toTwo(paidFlow.netPrice)
  );
  assert.equal(
    toTwo(Number(adminAfterSettle.walletBalance) - Number(adminBeforeSettle.walletBalance)),
    expectedAdminCommission
  );
  assert.equal(
    toTwo(Number(riderAfterSettle.walletBalance) - Number(riderBeforeSettle.walletBalance)),
    toTwo(expectedRiderPayout)
  );

  const settlementTxs = await prisma.transaction.findMany({
    where: {
      requestId: paidFlow.requestId,
      type: { in: ["VENDOR_PAYOUT", "ADMIN_COMMISSION", "DELIVERY_PAYOUT"] },
    },
    select: { type: true, amount: true, userId: true },
  });
  assert.equal(settlementTxs.length, 3);

  const repeatSettleResult = await settleOrder(paidFlow.requestId) as any;
  assert.ok(repeatSettleResult.alreadySettled, "Should return alreadySettled: true");

  console.log("Scenario 5: withdrawal reject refund path");
  await prisma.user.update({
    where: { id: vendor.id },
    data: { walletBalance: 500 },
  });
  const rejectionWithdrawal = await requestWithdrawal(vendor.id, 200);
  const vendorAfterHold = await prisma.user.findUnique({
    where: { id: vendor.id },
    select: { walletBalance: true },
  });
  assert.ok(vendorAfterHold);
  assert.equal(toTwo(Number(vendorAfterHold.walletBalance)), 300);

  const rejected = await reviewWithdrawal({
    withdrawalId: rejectionWithdrawal.id,
    adminId: admin.id,
    action: "reject",
    reviewNote: "Rejected in scenario test",
  });
  assert.equal(rejected.status, "REJECTED");

  const vendorAfterReject = await prisma.user.findUnique({
    where: { id: vendor.id },
    select: { walletBalance: true },
  });
  assert.ok(vendorAfterReject);
  assert.equal(toTwo(Number(vendorAfterReject.walletBalance)), 500);

  const refundTx = await prisma.transaction.findFirst({
    where: {
      userId: vendor.id,
      type: "REFUND",
      description: { contains: `withdrawal #${rejectionWithdrawal.id}` },
    },
    orderBy: { id: "desc" },
  });
  assert.ok(refundTx, "Refund transaction should be created on rejected withdrawal");

  console.log("Scenario 6: withdrawal approve path + already reviewed guard");
  await prisma.user.update({
    where: { id: vendor.id },
    data: { walletBalance: 600 },
  });
  const approvalWithdrawal = await requestWithdrawal(vendor.id, 250);
  const approved = await reviewWithdrawal({
    withdrawalId: approvalWithdrawal.id,
    adminId: admin.id,
    action: "approve",
    reviewNote: "Approved in scenario test",
  });
  assert.equal(approved.status, "APPROVED");

  const vendorAfterApprove = await prisma.user.findUnique({
    where: { id: vendor.id },
    select: { walletBalance: true },
  });
  assert.ok(vendorAfterApprove);
  assert.equal(toTwo(Number(vendorAfterApprove.walletBalance)), 350);

  const withdrawalTx = await prisma.transaction.findFirst({
    where: {
      userId: vendor.id,
      type: "WITHDRAWAL",
      description: { contains: `withdrawal #${approvalWithdrawal.id}` },
    },
    orderBy: { id: "desc" },
  });
  assert.ok(withdrawalTx, "Withdrawal ledger transaction should be created");

  await expectThrows(
    () =>
      reviewWithdrawal({
        withdrawalId: approvalWithdrawal.id,
        adminId: admin.id,
        action: "approve",
      }),
    "already reviewed"
  );

  console.log("Scenario 7: withdrawal exceeds balance guard");
  await expectThrows(
    () => requestWithdrawal(vendor.id, 999999),
    "exceeds available balance"
  );

  console.log("All transaction scenarios passed");
}

run()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.stack ?? error.message : String(error);
    console.error("Transactions scenarios test failed");
    console.error(message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
