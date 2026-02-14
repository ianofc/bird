import { BirdLayout } from "@/components/bird/BirdLayout";
import { useBird } from "@/contexts/BirdContext";
import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft } from "lucide-react";

const Messages = () => {
  const { users, messages, sendMessage, currentUser } = useBird();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUsers = users.filter(u => u.id !== currentUser.id);

  const conversationMessages = selectedUserId
    ? messages.filter(m =>
        (m.fromId === currentUser.id && m.toId === selectedUserId) ||
        (m.fromId === selectedUserId && m.toId === currentUser.id)
      )
    : [];

  const getLastMessage = (userId: string) => {
    const msgs = messages.filter(m =>
      (m.fromId === currentUser.id && m.toId === userId) ||
      (m.fromId === userId && m.toId === currentUser.id)
    );
    return msgs[msgs.length - 1];
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversationMessages.length]);

  const handleSend = () => {
    if (!text.trim() || !selectedUserId) return;
    sendMessage(selectedUserId, text.trim());
    setText("");
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <BirdLayout>
      <h1 className="text-2xl font-bold text-foreground mb-2">Gorjeio</h1>
      <p className="text-muted-foreground text-sm mb-6">Suas conversas em tempo real.</p>

      <div className="bird-glass-strong rounded-2xl shadow-sm overflow-hidden min-h-[500px] flex flex-col md:flex-row">
        {/* Contacts list */}
        <div className={`w-full md:w-72 border-r border-border shrink-0 ${selectedUserId ? "hidden md:block" : ""}`}>
          <div className="p-4 border-b border-border">
            <input placeholder="Buscar conversa..." className="w-full bg-secondary rounded-lg px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
          </div>
          <div className="divide-y divide-border">
            {otherUsers.map(user => {
              const lastMsg = getLastMessage(user.id);
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors ${selectedUserId === user.id ? "bg-secondary" : ""}`}
                >
                  <div className={`w-10 h-10 rounded-full ${user.color} flex items-center justify-center text-sm font-bold shrink-0`}>
                    {user.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lastMsg ? lastMsg.content : "Inicie uma conversa"}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!selectedUserId ? "hidden md:flex" : "flex"}`}>
          {selectedUser ? (
            <>
              <div className="p-4 border-b border-border flex items-center gap-3">
                <button onClick={() => setSelectedUserId(null)} className="md:hidden text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className={`w-8 h-8 rounded-full ${selectedUser.color} flex items-center justify-center text-xs font-bold`}>
                  {selectedUser.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{selectedUser.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedUser.handle}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px]">
                {conversationMessages.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">Envie a primeira mensagem!</p>
                )}
                {conversationMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.fromId === currentUser.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      msg.fromId === currentUser.id
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 bg-secondary rounded-full px-4 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button onClick={handleSend} disabled={!text.trim()} className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Selecione uma conversa para começar
            </div>
          )}
        </div>
      </div>
    </BirdLayout>
  );
};

export default Messages;
