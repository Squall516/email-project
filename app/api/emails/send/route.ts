import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, text } = body;

    if (!to || !subject || !text) {
      return NextResponse.json({ error: "缺少收件人、主题或正文" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.qq.com",
      port: parseInt(process.env.SMTP_PORT || "465"),
      secure: true,
      auth: {
        user: process.env.IMAP_USER,
        pass: process.env.IMAP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"邮箱管家" <${process.env.IMAP_USER}>`,
      to: to,
      subject: subject,
      text: text,
    });

    return NextResponse.json({ success: true, message: "邮件发送成功！" });
  } catch (error) {
    console.error("发件报错:", error);
    return NextResponse.json({ error: "邮件发送失败，请检查配置" }, { status: 500 });
  }
}
