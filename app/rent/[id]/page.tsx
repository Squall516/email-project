"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";

function RentContent() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [account, setAccount] = useState<{ steamUsername: string; steamPassword: string; status: string; rentPrice: number; deposit: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerContact, setCustomerContact] = useState("");
  const [isRented, setIsRented] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/steam-accounts?id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setAccount(data);
        setLoading(false);
      })
      .catch(() => {
        setError("网络错误");
        setLoading(false);
      });
  }, [id]);

  const handleRent = async () => {
    if (!account || !customerName || !customerContact) return alert("请填写完整信息");
    const res = await fetch("/api/rentals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steamAccountId: id,
        customerName,
        customerContact,
        totalPrice: account.rentPrice || 0
      }),
    });
    if (res.ok) setIsRented(true);
    else alert("租赁失败，可能账号已被租出");
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    alert(`已复制${type}！`);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl text-gray-500">加载中...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl text-red-500">{error}</div>;
  if (!account) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl text-red-500">账号不存在</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-blue-600">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">🎮 蒸汽账号自助租赁</h1>
        <p className="text-center text-gray-500 mb-6">极速发货 · 即租即玩</p >

        {isRented || account.status === 'renting' ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded-xl text-center">
            <p className="text-green-800 font-bold mb-4">🎉 租借成功！请妥善保管账号</p >

            <div className="bg-white p-4 rounded-lg shadow-inner text-left font-mono text-sm mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500">账号：</span>
                <span className="font-bold text-gray-800 select-all">{account.steamUsername}</span>
                <button onClick={() => copyToClipboard(account.steamUsername, '账号')} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">复制</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">密码：</span>
                <span className="font-bold text-gray-800 select-all">{account.steamPassword}</span>
                <button onClick={() => copyToClipboard(account.steamPassword, '密码')} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">复制</button>
              </div>
            </div>

            <p className="text-xs text-red-500 mt-4">* 请在租用结束后主动联系管理员归还，否则押金不退。</p >
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">账号押金：<span className="font-bold text-gray-800">¥{account.deposit}</span></p >
              <p className="text-sm text-gray-600">时租价格：<span className="font-bold text-gray-800">¥{account.rentPrice}</span></p >
            </div>
            <input type="text" placeholder="请输入您的姓名/昵称" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            <input type="text" placeholder="请输入您的微信/QQ号" value={customerContact} onChange={(e) => setCustomerContact(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500" />
            <button onClick={handleRent} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors mt-2">立即租赁并获取账号</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl text-gray-500">加载中...</div>}>
      <RentContent />
    </Suspense>
  );
}
