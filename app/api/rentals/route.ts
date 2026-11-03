import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const orders = await prisma.rentalOrder.findMany({ orderBy: { createdAt: 'desc' }, include: { steamAccount: true } });
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const body = await request.json();
  const hours = parseFloat(body.rentHours) || 1;
  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

  const order = await prisma.rentalOrder.create({
    data: {
      steamAccountId: body.steamAccountId,
      customerName: body.customerName,
      customerContact: body.customerContact,
      totalPrice: parseFloat(body.totalPrice) || 0,
      expiresAt: expiresAt,
    },
  });
  await prisma.steamAccount.update({ where: { id: body.steamAccountId }, data: { status: "renting" } });
  return NextResponse.json(order, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const activeOrder = await prisma.rentalOrder.findFirst({ where: { steamAccountId: body.steamAccountId, status: "active" } });
  if (activeOrder) {
    await prisma.rentalOrder.update({ where: { id: activeOrder.id }, data: { status: "completed" } });
  }
  await prisma.steamAccount.update({ where: { id: body.steamAccountId }, data: { status: "idle" } });
  return NextResponse.json({ success: true });
}
