import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 获取所有邮箱列表
export async function GET() {
  try {
    const emails = await prisma.email.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(emails);
  } catch {
    return NextResponse.json({ error: "获取邮箱失败" }, { status: 500 });
  }
}

// 添加新邮箱
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newEmail = await prisma.email.create({ data: { address: body.address } });
    return NextResponse.json(newEmail, { status: 201 });
  } catch {
    return NextResponse.json({ error: "添加邮箱失败，可能是邮箱已存在" }, { status: 500 });
  }
}

// 删除邮箱
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "缺少邮箱 ID" }, { status: 400 });
    await prisma.email.delete({ where: { id: id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
