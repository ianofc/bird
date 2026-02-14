import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Send, Phone, MoreVertical, Smile, Paperclip, Mic, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Conversation {
  id: string;
  other_user: { username: string; display_name: string | null; avatar_url: string | null; user_id: string };
  last_message?: string;
  last_time?: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const Gorjeio = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [searchUser, setSearchUser] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    const { data: participations } = await supabase
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participations?.length) return;

    const convoIds = participations.map(p => p.conversation_id);
    const convos: Conversation[] = [];

    for (const convoId of convoIds) {
      const { data: otherPart } = await supabase
        .from("conversation_participants")
        .select("user_id")
        .eq("conversation_id", convoId)
        .neq("user_id", user.id)
        .single();

      if (!otherPart) continue;

      const { data: prof } = await supabase
        .from("profiles")
        .select("username, display_name, avatar_url, user_id")
        .eq("user_id", otherPart.user_id)
        .single();

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content, created_at")
        .eq("conversation_id", convoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      convos.push({
        id: convoId,
        other_user: prof || { username: "user", display_name: null, avatar_url: null, user_id: otherPart.user_id },
        last_message: lastMsg?.content,
        last_time: lastMsg?.created_at,
      });
    }

    setConversations(convos);
  }, [user]);

  const fetchMessages = useCallback(async (convoId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convoId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }, []);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  useEffect(() => {
    if (!selectedConvo) return;
    fetchMessages(selectedConvo);

    const channel = supabase
      .channel(`messages-${selectedConvo}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${selectedConvo}` },
        (payload) => { setMessages(prev => [...prev, payload.new as Message]); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConvo, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearchUser = async (query: string) => {
    setSearchUser(query);
    if (query.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("user_id, username, display_name, avatar_url")
      .ilike("username", `%${query}%`)
      .neq("user_id", user?.id || "")
      .limit(5);
    setSearchResults(data || []);
  };

  const startConversation = async (otherUserId: string) => {
    if (!user) return;
    // Check if conversation exists
    const existing = conversations.find(c => c.other_user.user_id === otherUserId);
    if (existing) {
      setSelectedConvo(existing.id);
      setShowMobileChat(true);
      setSearchUser("");
      setSearchResults([]);
      return;
    }

    const { data: convo } = await supabase.from("conversations").insert({}).select().single();
    if (!convo) return;

    await supabase.from("conversation_participants").insert([
      { conversation_id: convo.id, user_id: user.id },
      { conversation_id: convo.id, user_id: otherUserId },
    ]);

    setSelectedConvo(convo.id);
    setShowMobileChat(true);
    setSearchUser("");
    setSearchResults([]);
    fetchConversations();
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !user || !selectedConvo) return;
    const text = messageText.trim();
    setMessageText("");
    await supabase.from("messages").insert({
      conversation_id: selectedConvo,
      sender_id: user.id,
      content: text,
    });
  };

  const selectedConvoData = conversations.find(c => c.id === selectedConvo);

  const timeFormat = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="min-h-screen aurora-bg">
      <div className="pl-4 md:pl-24 pr-4 md:pr-6 py-4 md:py-6 max-w-[1400px] mx-auto">
        <div className="glass-strong rounded-2xl overflow-hidden flex h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] animate-fade-in">
          {/* Contacts - hidden on mobile when chat is open */}
          <div className={`w-full md:w-80 border-r border-border flex flex-col ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground mb-3">Gorjeio</h2>
              <div className="bg-secondary rounded-full px-3 py-2 flex items-center gap-2 relative">
                <Search size={14} className="text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar usuário..."
                  value={searchUser}
                  onChange={(e) => handleSearchUser(e.target.value)}
                  className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-2 glass-strong rounded-xl p-2 space-y-1">
                  {searchResults.map(u => (
                    <button key={u.user_id} onClick={() => startConversation(u.user_id)} className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                        {(u.display_name || u.username).slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{u.display_name || u.username}</p>
                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground text-sm">Nenhuma conversa ainda.</p>
                  <p className="text-muted-foreground text-xs mt-1">Busque um usuário para começar!</p>
                </div>
              ) : conversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => { setSelectedConvo(convo.id); setShowMobileChat(true); }}
                  className={`w-full p-4 flex items-center gap-3 transition-colors text-left ${
                    selectedConvo === convo.id ? "bg-sidebar-accent" : "hover:bg-secondary"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {(convo.other_user.display_name || convo.other_user.username).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-sm text-foreground truncate">{convo.other_user.display_name || convo.other_user.username}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">{timeFormat(convo.last_time)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{convo.last_message || "..."}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className={`flex-1 flex flex-col ${!showMobileChat && !selectedConvo ? 'hidden md:flex' : ''} ${showMobileChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedConvo && selectedConvoData ? (
              <>
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowMobileChat(false)} className="md:hidden text-muted-foreground">
                      <ArrowLeft size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                      {(selectedConvoData.other_user.display_name || selectedConvoData.other_user.username).slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{selectedConvoData.other_user.display_name || selectedConvoData.other_user.username}</p>
                      <p className="text-xs text-muted-foreground">online</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors">
                      <Phone size={16} />
                    </button>
                    <button className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] md:max-w-[65%] px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender_id === user?.id
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}>
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {timeFormat(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <div className="p-3 md:p-4 border-t border-border flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground transition-colors hidden md:flex">
                    <Paperclip size={18} />
                  </button>
                  <div className="flex-1 bg-secondary rounded-full px-4 py-2.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder="Escreva uma mensagem..."
                      className="bg-transparent outline-none text-sm flex-1 text-foreground placeholder:text-muted-foreground"
                    />
                    <button className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">
                      <Smile size={18} />
                    </button>
                  </div>
                  <button onClick={sendMessage} className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shrink-0">
                    <Send size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Send size={24} className="text-primary/50" />
                  </div>
                  <p className="text-muted-foreground font-medium">Selecione uma conversa</p>
                  <p className="text-sm text-muted-foreground mt-1">ou busque alguém para começar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gorjeio;
