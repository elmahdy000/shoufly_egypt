"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/shoofly/button";
import { useAsyncData } from "@/lib/hooks/use-async-data";
import { listConversations, listChatMessages, sendChatMessage } from "@/lib/api/chat";
import { FiSend, FiMessageSquare, FiSearch, FiArrowRight } from "react-icons/fi";
import { formatRelative } from "date-fns";
import { ar } from "date-fns/locale";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialOtherId = searchParams.get('otherId');
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: conversations, loading: convsLoading, refresh: refreshConvs } = useAsyncData(
    () => listConversations(),
    []
  );

  const { data: messages, loading: msgLoading, refresh: refreshMsgs } = useAsyncData(
    () => (selectedUser ? listChatMessages(selectedUser.id) : Promise.resolve([])),
    [selectedUser]
  );

  useEffect(() => {
    if (conversations && initialOtherId && !selectedUser) {
        const found = conversations.find(c => c.id === parseInt(initialOtherId));
        if (found) setSelectedUser(found);
    }
  }, [conversations, initialOtherId, selectedUser]);

  useEffect(() => {
    const interval = setInterval(() => {
        if (selectedUser) refreshMsgs();
        refreshConvs();
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedUser]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    try {
      setIsSending(true);
      await sendChatMessage(selectedUser.id, message);
      setMessage("");
      refreshMsgs();
      refreshConvs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  }

  const getAnonymizedName = (user: any) => {
    if (!user) return "مستخدم غير معروف";
    if (user.role === 'ADMIN') return "إدارة شوفلي";
    if (user.role === 'VENDOR') return `مورّد #${user.id}`;
    if (user.role === 'CLIENT') return `عميل #${user.id}`;
    return user.name;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans dir-rtl text-right overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <Link href="/client" className="text-slate-500 hover:text-primary transition-colors">
          <FiArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">الرسائل</h1>
          <p className="text-xs text-slate-500">تواصل مع التجار والدعم</p>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation List */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-l border-slate-200 bg-white">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="بحث..." 
                className="w-full pr-9 pl-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convsLoading ? (
               <div className="text-center py-10 text-slate-400 text-sm">جاري التحميل...</div>
            ) : (conversations ?? []).length === 0 ? (
               <div className="text-center py-10 text-slate-400 text-sm">لا توجد محادثات</div>
            ) : conversations?.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedUser(c)}
                className={`w-full text-right p-4 border-b border-slate-100 flex items-center gap-3 transition-colors ${
                  selectedUser?.id === c.id ? 'bg-primary/5 border-r-2 border-r-primary' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  selectedUser?.id === c.id ? 'bg-primary text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {c.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                   <p className={`text-sm font-medium truncate ${selectedUser?.id === c.id ? 'text-slate-900' : 'text-slate-700'}`}>
                     {getAnonymizedName(c)}
                   </p>
                   <p className="text-xs text-slate-500 truncate">{c.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="hidden md:flex flex-1 flex-col bg-slate-50">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 bg-white">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                  {selectedUser.name[0]}
                </div>
                <div>
                  <h2 className="font-medium text-slate-900">{getAnonymizedName(selectedUser)}</h2>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> متصل
                  </p>
                </div>
              </div>

              {/* Message History */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {msgLoading ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-sm">جاري التحميل...</div>
                ) : (messages ?? []).map((m: any) => {
                  const isMe = m.senderId !== selectedUser.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}>
                       <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                         isMe 
                         ? 'bg-slate-800 text-white rounded-br-none' 
                         : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                       }`}>
                          <p>{m.content}</p>
                          <p className={`text-[10px] mt-1 ${isMe ? 'text-slate-400' : 'text-slate-400'}`}>
                            {formatRelative(new Date(m.createdAt), new Date(), { locale: ar })}
                          </p>
                       </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="اكتب رسالتك..." 
                      className="flex-1 bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg text-sm outline-none focus:border-primary"
                    />
                    <Button 
                      type="submit"
                      disabled={isSending || !message.trim()}
                      className="h-9 w-9 p-0 bg-primary text-white rounded-lg"
                    >
                      <FiSend size={16} className="rotate-180" />
                    </Button>
                 </div>
              </form>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
               <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4">
                 <FiMessageSquare size={28} />
               </div>
               <h2 className="text-lg font-semibold text-slate-900 mb-2">اختر محادثة</h2>
               <p className="text-sm text-slate-500">اختر جهة اتصال من القائمة لبدء المحادثة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
