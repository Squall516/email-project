import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  try {
    if (id) {
      const account = await prisma.steamAccount.findUnique({ where: { id }, include: { email: true } });
      if (!account) return NextResponse.json({ error: "账号不存在" }, { status: 404 });
      return NextResponse.json(account);
    }
    const accounts = await prisma.steamAccount.findMany({ orderBy: { createdAt: 'desc' }, include: { email: true } });
    return NextResponse.json(accounts);
  } catch {
    return NextResponse.json({ error: "查询失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newAccount = await prisma.steamAccount.create({
      data: {
        steamUsername: body.steamUsername,
        steamPassword: body.steamPassword,
        deposit: parseFloat(body.deposit) || 0,
        rentPrice: parseFloat(body.rentPrice) || 0,
        emailId: body.emailId || null,
      },
    });
    return NextResponse.json(newAccount, { status: 201 });
  } catch { return NextResponse.json({ error: "添加失败" }, { status: 500 }); }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 ID" }, { status: 400 });
  await prisma.steamAccount.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
