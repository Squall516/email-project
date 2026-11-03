import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export async function GET() {
  const host = process.env.IMAP_HOST;
  const user = process.env.IMAP_USER;
  const pass = process.env.IMAP_PASS;
  if (!host || !user || !pass) {
    return NextResponse.json({ error: "请配置 IMAP_HOST、IMAP_USER 和 IMAP_PASS" }, { status: 503 });
  }
  const client = new ImapFlow({
    host, port: Number(process.env.IMAP_PORT || "993"), secure: true,
    auth: { user, pass }, logger: false,
  });
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const status = await client.status("INBOX", { messages: true });
      const fetchedData = [];
      const count = status ? (status.messages ?? 0) : 0;
      if (count > 0) {
        const start = Math.max(1, count - 4);
        for await (const message of client.fetch(`${start}:*`, { source: true })) {
          if (!message.source) continue;
          const parsed = await simpleParser(message.source);
          const matches = ((parsed.text || "") + "\n" + (parsed.html || "")).match(/\b\d{4,6}\b/g);
          fetchedData.push({ from: parsed.from?.text || "未知发件人",
            subject: parsed.subject || "(无主题)", code: matches ? matches[0] : "未找到", date: parsed.date });
        }
      }
      return NextResponse.json(fetchedData.reverse());
    } finally {
      lock.release();
    }
  } catch {
    return NextResponse.json({ error: "拉取邮件失败，请检查本地配置" }, { status: 500 });
  } finally {
    try { await client.logout(); } catch { client.close(); }
  }
}
