import { BirdLayout } from "@/components/bird/BirdLayout";
import { useBird } from "@/contexts/BirdContext";
import api from "@/services/api";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, Paperclip, Search, Send, Smile } from "lucide-react";

type ChatUser = {
  id: number;
  username: string;
  name: string;
  handle: string;
  initials: string;
  avatar?: string | null;
};

type ChatMessage = {
  id: number | string;
  room_id: number;
  sender: ChatUser;
  content: string;
  created_at: string;
  is_read: boolean;
  optimistic?: boolean;
};

type ChatRoom = {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  participants: ChatUser[];
  last_message?: ChatMessage | null;
  unread_count: number;
};

const avatarPalette = ["bg-[#5e8fcd]", "bg-[#56a59a]", "bg-[#a47ad9]", "bg-[#c97d5d]", "bg-[#4f97d8]"];

const toTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--:--";
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
};

const wsUrlForRoom = (roomId: number) => {
  const token = localStorage.getItem("@Bird:token");
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const host = import.meta.env.VITE_WS_HOST || window.location.host;
  return `${protocol}://${host}/ws/chat/${roomId}/?token=${token ?? ""}`;
};

const Messages = () => {
  const { currentUser } = useBird();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [typingState, setTypingState] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const typingTimerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredRooms = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rooms;
    return rooms.filter((r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q));
  }, [rooms, search]);

  const selectedRoom = useMemo(() => rooms.find((room) => room.id === selectedRoomId) ?? null, [rooms, selectedRoomId]);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const { data } = await api.get("/api/chat/rooms/");
      const nextRooms: ChatRoom[] = data.rooms ?? [];
      setRooms(nextRooms);
      if (!selectedRoomId && nextRooms.length > 0) {
        setSelectedRoomId(nextRooms[0].id);
      }
    } finally {
      setLoadingRooms(false);
    }
  };

  const loadMessages = async (roomId: number) => {
    setLoadingMessages(true);
    try {
      const { data } = await api.get(`/api/chat/rooms/${roomId}/messages/`);
      setMessages(data.messages ?? []);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  useEffect(() => {
    if (!selectedRoomId) return;
    loadMessages(selectedRoomId);
  }, [selectedRoomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!selectedRoomId) return;

    const socket = new WebSocket(wsUrlForRoom(selectedRoomId));
    wsRef.current = socket;

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      if (payload.type === "typing") {
        setTypingState(`${payload.username} está digitando...`);
        window.clearTimeout(typingTimerRef.current ?? undefined);
        typingTimerRef.current = window.setTimeout(() => setTypingState(""), 1200);
        return;
      }

      if (payload.type === "message") {
        setMessages((prev) => {
          const withoutOptimistic = prev.filter((m) => !(m.optimistic && m.sender.username === payload.username && m.content === payload.message));
          return [
            ...withoutOptimistic,
            {
              id: payload.message_id,
              room_id: selectedRoomId,
              sender: {
                id: -1,
                username: payload.username,
                name: payload.username,
                handle: `@${payload.username}`,
                initials: payload.username.slice(0, 2).toUpperCase(),
              },
              content: payload.message,
              created_at: new Date().toISOString(),
              is_read: false,
            },
          ];
        });

        setRooms((prev) =>
          prev.map((r) =>
            r.id === selectedRoomId
              ? {
                  ...r,
                  last_message: {
                    id: payload.message_id,
                    room_id: selectedRoomId,
                    sender: {
                      id: -1,
                      username: payload.username,
                      name: payload.username,
                      handle: `@${payload.username}`,
                      initials: payload.username.slice(0, 2).toUpperCase(),
                    },
                    content: payload.message,
                    created_at: new Date().toISOString(),
                    is_read: false,
                  },
                }
              : r,
          ),
        );
      }
    };

    return () => {
      socket.close();
      wsRef.current = null;
    };
  }, [selectedRoomId]);

  const selectedMessages = selectedRoom ? messages.filter((m) => m.room_id === selectedRoom.id) : [];

  const handleTyping = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "typing" }));
  };

  const handleSend = () => {
    if (!selectedRoom || !text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || !currentUser) return;

    const content = text.trim();
    const optimistic: ChatMessage = {
      id: `optimistic-${Date.now()}`,
      room_id: selectedRoom.id,
      sender: {
        id: Number(currentUser.id),
        username: currentUser.username,
        name: currentUser.name,
        handle: currentUser.handle,
        initials: currentUser.initials,
      },
      content,
      created_at: new Date().toISOString(),
      is_read: false,
      optimistic: true,
    };

    setMessages((prev) => [...prev, optimistic]);
    wsRef.current.send(JSON.stringify({ type: "message", message: content }));
    setText("");
  };

  return (
    <BirdLayout>
      <div className="rounded-3xl overflow-hidden shadow-xl border border-[#1f2c38] bg-[#18222d] min-h-[78vh] flex">
        <aside className={`w-full md:w-[360px] bg-[#17212b] border-r border-[#22303d] ${selectedRoom ? "hidden md:flex" : "flex"} flex-col`}>
          <div className="px-4 pt-4 pb-3 bg-[#242f3d] border-b border-[#2b3b49]">
            <h1 className="text-lg font-semibold text-white mb-3">Gorjeio</h1>
            <div className="flex items-center gap-2 bg-[#18222d] rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar"
                className="bg-transparent w-full text-sm text-slate-100 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="overflow-y-auto">
            {loadingRooms && <p className="p-4 text-sm text-slate-300">Carregando conversas...</p>}
            {!loadingRooms && filteredRooms.length === 0 && <p className="p-4 text-sm text-slate-400">Nenhuma conversa encontrada.</p>}
            {filteredRooms.map((room, idx) => {
              const first = room.participants[0];
              const initials = first?.initials ?? room.title.slice(0, 2).toUpperCase();
              const color = avatarPalette[idx % avatarPalette.length];
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 text-left border-b border-white/5 hover:bg-[#2b5278]/60 transition ${selectedRoomId === room.id ? "bg-[#2b5278]" : ""}`}
                >
                  <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center font-bold text-white`}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <p className="font-medium text-white truncate">{room.title}</p>
                      <span className="text-xs text-slate-400">{room.last_message ? toTime(room.last_message.created_at) : "--:--"}</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate">{room.last_message?.content ?? room.subtitle}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className={`flex-1 ${!selectedRoom ? "hidden md:flex" : "flex"} flex-col bg-[#0f1923]`}>
          {selectedRoom ? (
            <>
              <header className="px-4 py-3 bg-[#242f3d] border-b border-[#2b3b49] flex items-center gap-3">
                <button onClick={() => setSelectedRoomId(null)} className="md:hidden text-slate-300">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-[#5e8fcd] flex items-center justify-center text-white text-sm font-bold">
                  {(selectedRoom.participants[0]?.initials ?? selectedRoom.title.slice(0, 2)).toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-semibold leading-none">{selectedRoom.title}</p>
                  <p className="text-xs text-slate-300 mt-1">{typingState || selectedRoom.subtitle}</p>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[radial-gradient(circle_at_top,_#1b2b3a_0,_#0f1923_55%)]">
                {loadingMessages && <p className="text-sm text-slate-300">Carregando mensagens...</p>}
                {!loadingMessages && selectedMessages.length === 0 && <p className="text-center text-sm text-slate-400 pt-8">Ainda não há mensagens.</p>}

                {selectedMessages.map((msg) => {
                  const isMine = msg.sender.username === currentUser?.username;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm shadow ${isMine ? "bg-[#2b5278] text-white rounded-br-md" : "bg-[#182533] text-slate-100 rounded-bl-md"}`}>
                        <p>{msg.content}</p>
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-[11px] text-slate-300">{toTime(msg.created_at)}</span>
                          {isMine && <CheckCheck className="w-3 h-3 text-sky-300" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <footer className="px-3 py-3 bg-[#242f3d] border-t border-[#2b3b49] flex items-center gap-2">
                <button className="text-slate-300 hover:text-white transition" aria-label="emoji">
                  <Smile className="w-5 h-5" />
                </button>
                <button className="text-slate-300 hover:text-white transition" aria-label="anexo">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    handleTyping();
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Mensagem"
                  className="flex-1 rounded-full bg-[#182533] text-slate-100 px-4 py-2 text-sm outline-none placeholder:text-slate-400"
                />
                <button onClick={handleSend} disabled={!text.trim()} className="w-10 h-10 rounded-full bg-[#2ea6ff] disabled:opacity-50 text-white flex items-center justify-center" aria-label="enviar">
                  <Send className="w-4 h-4" />
                </button>
              </footer>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Selecione um chat.</div>
          )}
        </section>
      </div>
    </BirdLayout>
  );
};

export default Messages;
