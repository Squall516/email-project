import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (typeof password === "string" && adminPassword && password === adminPassword) {
      // 登录成功，创建一个响应，并种下 cookie
      const response = NextResponse.json({ success: true });
      response.cookies.set("auth_token", "true", {
        httpOnly: true, // 防止前端js读取，防跨站脚本攻击
        maxAge: 60 * 60 * 24 * 7, // 有效期7天
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "密码错误！" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
