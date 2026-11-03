"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Email { id: string; address: string; status: string; createdAt: string; }
interface FetchedEmail { from: string; subject: string; code: string; date: string; }
interface SteamAccount { id: string; steamUsername: string; steamPassword: string; status: string; deposit: number; rentPrice: number; emailId: string | null; email?: Email; }
interface RentalOrder { id: string; steamAccountId: string; customerName: string; customerContact: string; totalPrice: number; status: string; createdAt: string; expiresAt: string | null; steamAccount?: SteamAccount; }

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<Email[]>([]);
  const [, setFetchedEmails] = useState<FetchedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetchingMail = useRef(false);

  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);
  const [steamUsername, setSteamUsername] = useState("");
  const [steamPassword, setSteamPassword] = useState("");
  const [steamDeposit, setSteamDeposit] = useState("0");
  const [steamRentPrice, setSteamRentPrice] = useState("0");
  const [selectedEmailId, setSelectedEmailId] = useState("");
  const [steamAccounts, setSteamAccounts] = useState<SteamAccount[]>([]);

  const [isRentModalOpen, setIsRentModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SteamAccount | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [rentPrice, setRentPrice] = useState("0");
  const [rentHours, setRentHours] = useState("1"); // 🆕 租用时长

  const [rentals, setRentals] = useState<RentalOrder[]>([]);
  const [todayString, setTodayString] = useState("");

  const fetchEmails = async () => { const res = await fetch("/api/emails"); const data = await res.json(); if (Array.isArray(data)) setEmails(data); };
  const fetchSteamAccounts = async () => { const res = await fetch("/api/steam-accounts"); const data = await res.json(); if (Array.isArray(data)) setSteamAccounts(data); };
  const fetchRentals = async () => { const res = await fetch("/api/rentals"); const data = await res.json(); if (Array.isArray(data)) { setRentals(data); setTodayString(new Date().toDateString()); } };

  const handleFetchMails = useCallback(async () => {
    if (fetchingMail.current) return; fetchingMail.current = true; setIsLoading(true);
    try { const res = await fetch("/api/emails/fetch"); const data = await res.json(); if (Array.isArray(data)) setFetchedEmails(data); }
    catch (error) { console.error(error); } finally { fetchingMail.current = false; setIsLoading(false); }
  }, []);

  const handleCleanup = async () => {
    const res = await fetch("/api/rentals/cleanup");
    const data = await res.json();
    if (data.success) {
      alert(`✅ 清理完成！成功回收了 ${data.cleanedCount} 个过期账号。`);
      fetchSteamAccounts();
      fetchRentals();
    } else {
      alert("❌ 清理失败");
    }
  };

  const handleAddEmail = async () => {
    if (emailInput.trim() === "") return;
    const res = await fetch("/api/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: emailInput }) });
    if (res.ok) { await fetchEmails(); setEmailInput(""); setIsModalOpen(false); } else alert("添加失败");
  };

  const handleAddSteamAccount = async () => {
    if (!steamUsername || !steamPassword) return alert("请填写账号和密码");
    const res = await fetch("/api/steam-accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ steamUsername, steamPassword, deposit: steamDeposit, rentPrice: steamRentPrice, emailId: selectedEmailId }) });
    if (res.ok) { await fetchSteamAccounts(); setSteamUsername(""); setSteamPassword(""); setSteamDeposit("0"); setSteamRentPrice("0"); setSelectedEmailId(""); setIsSteamModalOpen(false); } else alert("添加失败");
  };

  const handleDeleteSteamAccount = async (id: string) => {
    if (!confirm("确定要删除这个账号吗？")) return;
    const res = await fetch(`/api/steam-accounts?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchSteamAccounts(); else alert("删除失败");
  };

  const handleRentAccount = async () => {
    if (!customerName || !customerContact) return alert("请填写租客信息");
    const res = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ steamAccountId: selectedAccount?.id, customerName, customerContact, totalPrice: rentPrice, rentHours: rentHours })
    });
    if (res.ok) {
      await fetchSteamAccounts();
      await fetchRentals();
      setIsRentModalOpen(false); setCustomerName(""); setCustomerContact(""); setRentPrice("0"); setRentHours("1");
    } else alert("出租失败");
  };

  const handleReturnAccount = async (accountId: string) => {
    if (!confirm("确认租客已归还账号吗？")) return;
    const res = await fetch("/api/rentals", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ steamAccountId: accountId }) });
    if (res.ok) { await fetchSteamAccounts(); await fetchRentals(); } else alert("归还失败");
  };

  useEffect(() => {
    let cancelled = false;
    Promise.all(["/api/emails", "/api/steam-accounts", "/api/rentals"].map(url =>
      fetch(url).then(response => response.json())
    )).then(([emailData, accountData, rentalData]) => {
      if (cancelled) return;
      if (Array.isArray(emailData)) setEmails(emailData);
      if (Array.isArray(accountData)) setSteamAccounts(accountData);
      if (Array.isArray(rentalData)) setRentals(rentalData);
      setTodayString(new Date().toDateString());
      void handleFetchMails();
    }).catch(() => console.error("Failed to load dashboard data"));
    const interval = setInterval(() => { void handleFetchMails(); }, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [handleFetchMails]);

  const todayIncome = todayString ? rentals.filter(r => new Date(r.createdAt).toDateString() === todayString).reduce((sum, r) => sum + r.totalPrice, 0) : 0;
  const totalOrders = rentals.length;
  const activeRentals = steamAccounts.filter(a => a.status === 'renting').length;
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-blue-600 mb-8">📧 邮箱管家</h1>
        <nav className="flex flex-col gap-4">
          <a href=" " className="text-blue-600 font-medium bg-blue-50 px-4 py-2 rounded-lg">控制台</a >
          <a href="#" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">邮箱管理</a >
          <a href="#" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">Steam账号</a >
          <a href="#" className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg transition-colors">租赁订单</a >
        </nav>
      </aside>

      <main className="flex-1 p-10 overflow-auto">
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800">控制台概览</h2>
          <div className="flex gap-2">
            <button onClick={handleCleanup} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">🧹 清理过期账号</button>
            <button onClick={handleFetchMails} disabled={isLoading} className={`px-4 py-2 rounded-lg font-medium transition-colors ${isLoading ? 'bg-gray-400 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}>{isLoading ? "正在拉取..." : "🔄 手动拉取"}</button>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">+ 添加邮箱</button>
            <button onClick={() => setIsSteamModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium">+ 添加 Steam</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">活跃邮箱数</p >
            <p className="text-3xl font-bold text-gray-800">{emails.length}</p >
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">今日总收入</p >
            <p className="text-3xl font-bold text-green-600">¥{todayIncome}</p >
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">总订单数</p >
            <p className="text-3xl font-bold text-blue-600">{totalOrders}</p >
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm mb-1">当前出租中</p >
            <p className="text-3xl font-bold text-orange-500">{activeRentals}</p >
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Steam 账号仓库</h3>
          {steamAccounts.length === 0 ? ( <div className="text-center text-gray-400 py-6">暂无账号</div> ) : (
            <ul className="flex flex-col gap-3">
              {steamAccounts.map((acc) => (
                <li key={acc.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-gray-800 font-medium">{acc.steamUsername}</p >
                    <p className="text-gray-500 text-xs mt-1">
                      {"押金: ¥"}{acc.deposit}{" | 租金: ¥"}{acc.rentPrice}{" | 邮箱: "}{acc.email ? acc.email.address : "未绑定"}
                    </p >
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={`/rent/${acc.id}`} target="_blank" className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm px-3 py-1 rounded transition-colors">🔗 租赁页</a >
                    <span className={`text-sm px-3 py-1 rounded font-bold ${acc.status === 'idle' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{acc.status === 'idle' ? "空闲" : "租赁中"}</span>
                    {acc.status === 'idle' ? (
                      <button onClick={() => { setSelectedAccount(acc); setIsRentModalOpen(true); }} className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded transition-colors">出租</button>
                    ) : (
                      <button onClick={() => handleReturnAccount(acc.id)} className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded transition-colors">归还</button>
                    )}
                    <button onClick={() => handleDeleteSteamAccount(acc.id)} className="text-red-500 hover:text-red-700 text-sm">删除</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📋 租赁订单记录</h3>
          {rentals.length === 0 ? ( <div className="text-center text-gray-400 py-6">暂无订单记录</div> ) : (
            <ul className="flex flex-col gap-3">
              {rentals.map((order) => (
                <li key={order.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-lg border border-gray-100">
                  <div>
                    <p className="text-gray-800 font-medium">租客：{order.customerName} ({order.customerContact})</p >
                    <p className="text-gray-500 text-xs mt-1">账号：{order.steamAccount?.steamUsername || "未知"} | 租金：¥{order.totalPrice} {order.expiresAt && `| 到期：${new Date(order.expiresAt).toLocaleString()}`}</p >
                  </div>
                  <span className={`text-sm px-3 py-1 rounded font-bold ${order.status === 'active' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                    {order.status === 'active' ? "进行中" : "已归还"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {isRentModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">出租账号：{selectedAccount?.steamUsername}</h3>
            <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="租客姓名/昵称" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3" />
            <input type="text" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} placeholder="租客联系方式（微信/QQ）" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3" />
            <input type="number" value={rentPrice} onChange={(e) => setRentPrice(e.target.value)} placeholder="本次收取租金" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3" />
            <input type="number" value={rentHours} onChange={(e) => setRentHours(e.target.value)} placeholder="租用时长（小时）" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsRentModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleRentAccount} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">确认出租</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">添加新邮箱</h3>
            <input type="text" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} placeholder="输入邮箱地址..." className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleAddEmail} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">确认添加</button>
            </div>
          </div>
        </div>
      )}

      {isSteamModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-gray-800">添加 Steam 账号</h3>
            <input type="text" value={steamUsername} onChange={(e) => setSteamUsername(e.target.value)} placeholder="Steam 登录账号" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3" />
            <input type="text" value={steamPassword} onChange={(e) => setSteamPassword(e.target.value)} placeholder="Steam 登录密码" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3" />
            <input type="number" value={steamDeposit} onChange={(e) => setSteamDeposit(e.target.value)} placeholder="押金 (如 100)" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3" />
            <input type="number" value={steamRentPrice} onChange={(e) => setSteamRentPrice(e.target.value)} placeholder="时租/日租价格 (如 5)" className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3" />
            <label className="block text-gray-700 text-sm font-bold mb-2">绑定注册邮箱：</label>
            <select value={selectedEmailId} onChange={(e) => setSelectedEmailId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-6">
              <option value="">不绑定 / 暂不选择</option>
              {emails.map(email => ( <option key={email.id} value={email.id}>{email.address}</option> ))}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsSteamModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleAddSteamAccount} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">确认录入</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
