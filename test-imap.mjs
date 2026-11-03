import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

const client = new ImapFlow({
  host: process.env.IMAP_HOST,
  port: parseInt(process.env.IMAP_PORT),
  secure: true,
  auth: {
    user: process.env.IMAP_USER,
    pass: process.env.IMAP_PASS,
  },
  logger: false,
});

async function fetchAndExtractCodes() {
  console.log("⏳ 正在连接你的邮箱服务器...");
  await client.connect();
  console.log("✅ 连接成功！正在打开收件箱...");

  let lock = await client.getMailboxLock("INBOX");
  try {
    const status = await client.status("INBOX", { messages: true });
    console.log(`📬 收件箱共有 ${status.messages} 封邮件`);

    if (status.messages === 0) return;

    console.log("正在拉取最新的 5 封邮件并尝试提取验证码...\n");
    const messages = [];
    // 拉取最新的 5 封
    const start = Math.max(1, status.messages - 4);
    for await (let message of client.fetch(`${start}:*`, { source: true })) {
      messages.push(message);
    }

    messages.reverse().forEach((msg, index) => {
      // 解析邮件源码
      simpleParser(msg.source).then(parsed => {
        const text = parsed.text || "";
        const html = parsed.html || "";

        // 组合文本和HTML进行搜索
        const fullContent = text + "\n" + html;

        // 提取验证码：寻找4到6位的数字
        const codeRegex = /\b\d{4,6}\b/g;
        const matches = fullContent.match(codeRegex);
        const code = matches ? matches[0] : "未找到";

        console.log(`--- 📩 第 ${index + 1} 封邮件 ---`);
        console.log(`主  题: ${parsed.subject || "(无主题)"}`);
        console.log(`🎯 提取到的验证码: ${code}`);
        console.log(`正文预览: ${text.substring(0, 60).replace(/\n/g, " ")}...`);
        console.log("");
      });
    });

    // 给解析留出一点时间
    await new Promise(resolve => setTimeout(resolve, 2000));

  } finally {
    lock.release();
  }
  await client.logout();
  console.log("🎉 读取完成，断开连接。");
}

fetchAndExtractCodes().catch(console.error);
