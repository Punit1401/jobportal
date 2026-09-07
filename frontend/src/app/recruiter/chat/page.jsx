"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import RecruiterSidebar from "@/components/RecruiterSidebar";
import { 
  Send, MessageSquare, Loader2, ArrowLeft, Search, Inbox 
} from "lucide-react";

export default function RecruiterChatPage() {
  const { data: session, status: authStatus } = useSession();
  
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Mobile responsive: "list" vs "chat" thread view
  const [viewMode, setViewMode] = useState("list"); 

  const messagesEndRef = useRef(null);

  // Poll conversations every 4 seconds
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    
    fetchConversations(true); // first time with loader
    
    const interval = setInterval(() => {
      fetchConversations(false); // background sync
    }, 4000);

    return () => clearInterval(interval);
  }, [authStatus]);

  // Poll messages every 3 seconds if there is an active conversation
  useEffect(() => {
    if (authStatus !== "authenticated" || !activeConv) return;

    fetchMessages(activeConv._id, false); // first fetch is handled by activeConv click

    const interval = setInterval(() => {
      fetchMessages(activeConv._id, false); // poll in background
    }, 3000);

    return () => clearInterval(interval);
  }, [authStatus, activeConv?._id]);

  // Scroll to bottom when messages list changes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async (showLoader = false) => {
    if (showLoader) setLoadingConvs(true);
    try {
      const res = await fetch("/api/chat/conversations");
      const data = await res.json();
      if (data.success) {
        setConversations(data.conversations || []);
        
        // Update active conversation reference with latest unread status if it exists
        if (activeConv) {
          const updated = data.conversations.find(c => c._id === activeConv._id);
          if (updated) {
            setActiveConv(updated);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      if (showLoader) setLoadingConvs(false);
    }
  };

  const fetchMessages = async (conversationId, showLoader = false) => {
    if (showLoader) setLoadingMsgs(true);
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      if (showLoader) setLoadingMsgs(false);
    }
  };

  const selectConversation = (conv) => {
    setActiveConv(conv);
    setViewMode("chat");
    fetchMessages(conv._id, true);
    
    // Optimistically clear unread count locally
    setConversations(prev => 
      prev.map(c => c._id === conv._id ? { ...c, unreadCountRecruiter: 0 } : c)
    );
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || sending) return;

    const messageText = inputText.trim();
    setInputText("");
    setSending(true);

    // Optimistically add message to list
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      conversationId: activeConv._id,
      senderId: session?.user?.id,
      senderRole: "recruiter",
      text: messageText,
      createdAt: new Date().toISOString(),
      read: false
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConv._id,
          text: messageText
        })
      });
      const data = await res.json();
      if (data.success) {
        // Replace temp message with actual database message
        setMessages(prev => prev.map(m => m._id === tempMsg._id ? data.message : m));
        // Refresh conversations to update last message
        fetchConversations(false);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      // Remove temp message on failure
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
    } finally {
      setSending(false);
    }
  };

  if (authStatus === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FDFEFF]">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  // Filter conversations based on candidate name or email
  const filteredConvs = conversations.filter(c => {
    const candidate = c.candidateId || {};
    const searchTarget = `${candidate.name || ""} ${candidate.email || ""}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#FDFEFF] flex flex-col lg:flex-row h-screen overflow-hidden">
      <RecruiterSidebar activePage="chat" />

      <main className="flex-1 overflow-hidden flex flex-col h-full bg-[#F8FAFC]">
        <div className="flex-1 flex overflow-hidden border border-slate-100/80 rounded-[40px] m-4 sm:m-6 shadow-xl shadow-slate-100/50 bg-white">
          
          {/* Conversation List Sidebar */}
          <div className={`w-full lg:w-96 flex flex-col border-r border-slate-100 bg-[#FAFCFD] h-full ${
            viewMode === "chat" ? "hidden lg:flex" : "flex"
          }`}>
            
            {/* Header */}
            <div className="p-6 border-b border-slate-100 bg-white shrink-0 rounded-tl-[40px]">
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <MessageSquare className="text-indigo-600" size={24} />
                Candidate Inbox
              </h1>
              <p className="text-slate-400 text-xs font-semibold mt-1">Communicate with job applicants</p>
              
              {/* Search */}
              <div className="mt-4 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {loadingConvs && conversations.length === 0 ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-indigo-600" size={28} />
                </div>
              ) : filteredConvs.length === 0 ? (
                <div className="text-center py-20 px-6">
                  <Inbox className="mx-auto text-slate-300 mb-3" size={40} />
                  <p className="text-slate-400 font-bold text-sm">No active chats</p>
                  <p className="text-slate-400 text-xs mt-1">Go to Responses and click 'Chat' on a candidate to start chatting.</p>
                </div>
              ) : (
                filteredConvs.map((conv) => {
                  const candidate = conv.candidateId || {};
                  const isSelected = activeConv?._id === conv._id;
                  const displayInitials = (candidate.name || "C").charAt(0).toUpperCase();
                  const hasUnread = conv.unreadCountRecruiter > 0;

                  return (
                    <div
                      key={conv._id}
                      onClick={() => selectConversation(conv)}
                      className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border ${
                        isSelected 
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                          : "bg-white hover:bg-slate-50 border-slate-100/50 hover:border-slate-200"
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 ${
                        isSelected ? "bg-white/15 text-white" : "bg-indigo-50 text-indigo-600"
                      }`}>
                        {displayInitials}
                      </div>

                      {/* Meta Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <h3 className={`font-black text-sm truncate ${isSelected ? "text-white" : "text-slate-800"}`}>
                            {candidate.name || "Candidate"}
                          </h3>
                          <span className={`text-[10px] shrink-0 font-bold ${
                            isSelected ? "text-indigo-200" : "text-slate-400"
                          }`}>
                            {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className={`text-[10px] font-bold mb-1 truncate ${
                          isSelected ? "text-indigo-200" : "text-slate-400"
                        }`}>
                          {candidate.email}
                        </p>
                        <p className={`text-xs truncate font-medium ${
                          isSelected ? "text-indigo-150" : hasUnread ? "text-slate-900 font-bold" : "text-slate-500"
                        }`}>
                          {conv.lastMessage || "No messages yet"}
                        </p>
                      </div>

                      {/* Unread badge */}
                      {hasUnread && !isSelected && (
                        <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 animate-pulse">
                          {conv.unreadCountRecruiter}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Thread Panel */}
          <div className={`flex-1 flex flex-col bg-[#F8FAFC] h-full ${
            viewMode === "list" ? "hidden lg:flex" : "flex"
          }`}>
            {activeConv ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex items-center justify-between shrink-0 rounded-tr-[40px] shadow-sm">
                  <div className="flex items-center gap-4">
                    {/* Back Button (Mobile only) */}
                    <button 
                      onClick={() => setViewMode("list")}
                      className="lg:hidden p-2 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                    >
                      <ArrowLeft size={20} />
                    </button>

                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-lg shrink-0">
                      {(activeConv.candidateId?.name || "C").charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h2 className="font-black text-slate-800 text-base">
                        {activeConv.candidateId?.name || "Candidate"}
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400">
                        {activeConv.candidateId?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {loadingMsgs && messages.length === 0 ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderRole === "recruiter";
                      return (
                        <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-[24px] px-5 py-3.5 shadow-sm text-sm font-semibold transition-all duration-300 ${
                            isMe 
                              ? "bg-indigo-600 text-white rounded-br-none shadow-indigo-100/30" 
                              : "bg-white text-slate-800 border border-slate-100 rounded-bl-none"
                          }`}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            <span className={`text-[9px] block text-right mt-1.5 font-bold uppercase tracking-wider ${
                              isMe ? "text-indigo-200" : "text-slate-400"
                            }`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Panel */}
                <form 
                  onSubmit={handleSendMessage}
                  className="p-4 sm:p-6 border-t border-slate-100 bg-white flex items-center gap-3 shrink-0 rounded-br-[40px]"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex items-center justify-center active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-indigo-100"
                  >
                    {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mb-6">
                  <MessageSquare size={36} />
                </div>
                <h3 className="text-lg font-black text-slate-800">Candidate Chat Thread</h3>
                <p className="text-slate-400 text-xs mt-1.5 max-w-sm font-semibold">
                  Select a chat from the sidebar to view conversations or reply in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
