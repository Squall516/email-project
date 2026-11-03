import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const now = new Date();
  const expiredOrders = await prisma.rentalOrder.findMany({
    where: { status: 'active', expiresAt: { lt: now } }
  });

  for (const order of expiredOrders) {
    await prisma.steamAccount.update({ where: { id: order.steamAccountId }, data: { status: 'idle' } });
    await prisma.rentalOrder.update({ where: { id: order.id }, data: { status: 'completed' } });
  }

  return NextResponse.json({ success: true, cleanedCount: expiredOrders.length });
}
