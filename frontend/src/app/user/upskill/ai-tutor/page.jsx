"use client";
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from '@/components/UserSidebar';
import { Send, GraduationCap, User, Bot, Loader2, PlusCircle, History, X, MessageSquare } from 'lucide-react';
import FeatureGuard from "@/components/FeatureGuard";

export default function AITutorPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [allChats, setAllChats] = useState([]); // બધી જૂની ચેટ્સના લિસ્ટ માટે
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef(null);

  // ૧. બધી ચેટ્સનું લિસ્ટ (History) લોડ કરવા માટે
  useEffect(() => {
    const fetchAllSessions = async () => {
      try {
        const res = await fetch('/api/ai/tutor');
        const data = await res.json();
        if (data.success) {
          setAllChats(data.sessions || []);
          // જો અગાઉની કોઈ ચેટ હોય તો સૌથી છેલ્લી ચેટ લોડ કરવી
          if (data.sessions && data.sessions.length > 0) {
            loadSpecificChat(data.sessions[0].id);
          } else {
            setMessages([{ role: 'assistant', content: 'Hello! I am your AI Career Tutor. How can I help you today?' }]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sessions");
      } finally {
        setFetchingHistory(false);
      }
    };
    fetchAllSessions();
  }, []);

  // ૨. કોઈ ચોક્કસ ચેટ લોડ કરવા માટે
  const loadSpecificChat = async (chatId) => {
    setFetchingHistory(true);
    try {
      const res = await fetch(`/api/ai/tutor?chatId=${chatId}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.history);
        setCurrentChatId(chatId);
        setShowHistory(false);
      }
    } catch (err) {
      console.error("Error loading chat");
    } finally {
      setFetchingHistory(false);
    }
  };

  // ૩. ઓટો સ્ક્રોલ
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // ૪. New Chat - નવી શરૂઆત કરવા માટે
  const handleNewChat = () => {
    setMessages([{ role: 'assistant', content: 'Hello! I am your AI Tutor. Let\'s start a new topic!' }]);
    setCurrentChatId(null);
    setShowHistory(false);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    const currentInput = input;
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput,
          chatId: currentChatId,
          history: messages.slice(-10)
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);

        // આ ફેરફાર છે: જો નવી ચેટ હોય તો તેને ઓટોમેટિક સાઇડબાર લિસ્ટ (allChats) માં ઉમેરો
        if (!currentChatId && data.chatId) {
          setCurrentChatId(data.chatId);
          const newChatEntry = {
            id: data.chatId,
            title: currentInput.length > 30 ? currentInput.substring(0, 30) + "..." : currentInput,
            updatedAt: new Date().toISOString()
          };
          setAllChats(prev => [newChatEntry, ...prev]);
        }
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting...' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden relative">
      <div className="hidden lg:block w-64 h-full flex-shrink-0 border-r border-slate-100">
        <Sidebar activePage="ai-tutor" />
      </div>

      {/* History Sidebar - Gemini Style */}
      {showHistory && (
        <div className="absolute inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 border-l border-slate-100 animate-in slide-in-from-right duration-300">
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <History size={20} className="text-indigo-600" /> Recent Chats
              </h2>
              <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {allChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => loadSpecificChat(chat.id)}
                  className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${currentChatId === chat.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                    }`}
                >
                  <MessageSquare size={16} className="text-slate-400" />
                  <p className="text-sm text-slate-700 font-medium truncate">{chat.title || "Untitled Chat"}</p>
                </div>
              ))}
              {allChats.length === 0 && <p className="text-center text-slate-400 text-xs py-10">No chat history yet.</p>}
            </div>

            <button onClick={handleNewChat} className="mt-4 w-full flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-2xl font-bold text-sm hover:bg-indigo-600 transition-all">
              <PlusCircle size={18} /> New Chat
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full bg-slate-50/50 relative min-w-0">
        <FeatureGuard featureName="Learning Features">
          <header className="h-20 flex-shrink-0 bg-white border-b border-slate-100 px-6 md:px-8 flex items-center justify-between z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              AI Tutor <GraduationCap size={28} className="text-indigo-600" />
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={() => setShowHistory(!showHistory)} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
              <History size={18} /> <span className="hidden md:block">Recent</span>
            </button>
            <button onClick={handleNewChat} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-md active:scale-95">
              <PlusCircle size={18} /> <span className="hidden md:block">New Chat</span>
            </button>
          </div>
        </header>

        <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 scroll-smooth">
          <div className="max-w-4xl mx-auto pb-40">
            {fetchingHistory ? (
              <div className="flex flex-col items-center justify-center p-20 gap-4">
                <Loader2 size={30} className="animate-spin text-indigo-600" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading conversation...</span>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                  <div className={`flex gap-3 md:gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${msg.role === 'user' ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-slate-200 text-slate-600'
                      }`}>
                      {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm md:text-base font-medium shadow-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-indigo-600" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </main>

        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-40">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleAsk} className="relative group shadow-2xl rounded-[24px]">
              <input
                type="text" value={input} onChange={(e) => setInput(e.target.value)}
                placeholder="Message AI Tutor..."
                className="w-full p-4 pr-14 md:p-5 md:pr-16 bg-white border border-slate-200 rounded-[24px] outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 md:right-3 md:top-2.5 p-3 md:p-3.5 bg-slate-900 text-white rounded-2xl hover:bg-indigo-600 transition-all disabled:opacity-30 shadow-lg"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
        </FeatureGuard>
      </div>
    </div>
  );
}