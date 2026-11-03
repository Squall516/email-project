"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!password) return;
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        alert("✅ 登录成功！即将进入后台");
        router.push("/");
        router.refresh();
      } else {
        alert("❌ " + (data.error || "登录失败"));
      }
    } catch {
      alert("网络错误");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">🔐 邮箱管家登录</h1>
        <p className="text-gray-500 text-sm mb-6 text-center">请输入管理员密码进入后台</p >

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6 focus:outline-none focus:border-blue-500 text-gray-800"
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
          进入后台
        </button>
      </div>
    </div>
  );
}
