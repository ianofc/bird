import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface User {
  id: string;
  name: string;
  handle: string;
  initials: string;
  color: string;
  bio?: string;
  followers: number;
  following: number;
  joinedDate: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userInitials: string;
  userColor: string;
  content: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  createdAt: Date;
}

export interface Message {
  id: string;
  fromId: string;
  fromName: string;
  fromInitials: string;
  fromColor: string;
  toId: string;
  content: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  type: "like" | "follow" | "message";
  fromName: string;
  fromInitials: string;
  fromColor: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

const MOCK_USERS: User[] = [
  { id: "me", name: "iansantos", handle: "@iansantos", initials: "IA", color: "bg-primary text-primary-foreground", bio: "Desenvolvedor apaixonado por tecnologia", followers: 142, following: 89, joinedDate: "2026" },
  { id: "u1", name: "Ian Santos", handle: "@ian_dev", initials: "IS", color: "bg-primary/20 text-primary", bio: "Full-stack dev", followers: 1200, following: 340, joinedDate: "2025" },
  { id: "u2", name: "Maria Costa", handle: "@maria_ui", initials: "MC", color: "bg-pink-100 text-pink-600", bio: "UI/UX Designer", followers: 890, following: 210, joinedDate: "2025" },
  { id: "u3", name: "Carlos Mendes", handle: "@carlos_m", initials: "CM", color: "bg-blue-100 text-blue-600", bio: "Backend engineer", followers: 560, following: 150, joinedDate: "2024" },
  { id: "u4", name: "Ana Silva", handle: "@ana_silva", initials: "AS", color: "bg-emerald-100 text-emerald-600", bio: "Product Manager", followers: 2100, following: 430, joinedDate: "2024" },
];

const MOCK_POSTS: Post[] = [
  {
    id: "p1", userId: "u1", userName: "Ian Santos", userHandle: "@ian_dev", userInitials: "IS", userColor: "bg-primary/20 text-primary",
    content: "Acabei de lançar meu novo projeto open source! 🚀 Confira no GitHub.", likes: 24, comments: 5, shares: 3, liked: false, createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "p2", userId: "u2", userName: "Maria Costa", userHandle: "@maria_ui", userInitials: "MC", userColor: "bg-pink-100 text-pink-600",
    content: "Dicas de UI/UX: sempre teste seus designs com usuários reais antes de lançar. A empatia é a melhor ferramenta do designer. 🎨", likes: 67, comments: 12, shares: 8, liked: true, createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: "p3", userId: "u4", userName: "Ana Silva", userHandle: "@ana_silva", userInitials: "AS", userColor: "bg-emerald-100 text-emerald-600",
    content: "O futuro das redes sociais é descentralizado. Vocês concordam? 🤔", likes: 89, comments: 34, shares: 15, liked: false, createdAt: new Date(Date.now() - 14400000),
  },
];

const MOCK_MESSAGES: Message[] = [
  { id: "m1", fromId: "u1", fromName: "Ian Santos", fromInitials: "IS", fromColor: "bg-primary/20 text-primary", toId: "me", content: "E aí, viu meu novo projeto?", createdAt: new Date(Date.now() - 1800000) },
  { id: "m2", fromId: "me", fromName: "iansantos", fromInitials: "IA", fromColor: "bg-primary text-primary-foreground", toId: "u1", content: "Vi sim! Ficou incrível! 🔥", createdAt: new Date(Date.now() - 1200000) },
  { id: "m3", fromId: "u2", fromName: "Maria Costa", fromInitials: "MC", fromColor: "bg-pink-100 text-pink-600", toId: "me", content: "Oi! Podemos colaborar no design?", createdAt: new Date(Date.now() - 600000) },
];

interface BirdContextType {
  currentUser: User;
  isLoggedIn: boolean;
  users: User[];
  posts: Post[];
  messages: Message[];
  notifications: Notification[];
  followingIds: string[];
  login: (handle: string, password: string) => boolean;
  signup: (name: string, handle: string, password: string) => boolean;
  logout: () => void;
  createPost: (content: string, imageUrl?: string) => void;
  likePost: (postId: string) => void;
  followUser: (userId: string) => void;
  unfollowUser: (userId: string) => void;
  sendMessage: (toId: string, content: string) => void;
  markNotificationRead: (id: string) => void;
  unreadNotifications: number;
}

const BirdContext = createContext<BirdContextType | null>(null);

export function BirdProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "n1", type: "like", fromName: "Ana Silva", fromInitials: "AS", fromColor: "bg-emerald-100 text-emerald-600", content: "curtiu seu post", read: false, createdAt: new Date(Date.now() - 300000) },
    { id: "n2", type: "follow", fromName: "Carlos Mendes", fromInitials: "CM", fromColor: "bg-blue-100 text-blue-600", content: "começou a seguir você", read: false, createdAt: new Date(Date.now() - 600000) },
  ]);
  const [followingIds, setFollowingIds] = useState<string[]>(["u1", "u2"]);

  const login = useCallback((handle: string, _password: string) => {
    const user = MOCK_USERS.find(u => u.handle === `@${handle}` || u.handle === handle);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      return true;
    }
    setCurrentUser(MOCK_USERS[0]);
    setIsLoggedIn(true);
    return true;
  }, []);

  const signup = useCallback((name: string, handle: string, _password: string) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      name,
      handle: `@${handle}`,
      initials: name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2),
      color: "bg-primary text-primary-foreground",
      followers: 0,
      following: 0,
      joinedDate: "2026",
    };
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    return true;
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
  }, []);

  const createPost = useCallback((content: string, imageUrl?: string) => {
    const newPost: Post = {
      id: `p${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userHandle: currentUser.handle,
      userInitials: currentUser.initials,
      userColor: currentUser.color,
      content,
      imageUrl,
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false,
      createdAt: new Date(),
    };
    setPosts(prev => [newPost, ...prev]);
  }, [currentUser]);

  const likePost = useCallback((postId: string) => {
    setPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
  }, []);

  const followUser = useCallback((userId: string) => {
    setFollowingIds(prev => [...prev, userId]);
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setNotifications(prev => [{
        id: `n${Date.now()}`,
        type: "follow" as const,
        fromName: currentUser.name,
        fromInitials: currentUser.initials,
        fromColor: currentUser.color,
        content: `você começou a seguir ${user.name}`,
        read: true,
        createdAt: new Date(),
      }, ...prev]);
    }
  }, [currentUser]);

  const unfollowUser = useCallback((userId: string) => {
    setFollowingIds(prev => prev.filter(id => id !== userId));
  }, []);

  const sendMessage = useCallback((toId: string, content: string) => {
    const newMsg: Message = {
      id: `m${Date.now()}`,
      fromId: currentUser.id,
      fromName: currentUser.name,
      fromInitials: currentUser.initials,
      fromColor: currentUser.color,
      toId,
      content,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);

    // Simulate a reply after 2 seconds
    const toUser = MOCK_USERS.find(u => u.id === toId);
    if (toUser) {
      setTimeout(() => {
        const replies = ["Interessante! 🤔", "Concordo! 👍", "Vamos conversar mais sobre isso!", "Legal demais! 🚀", "Obrigado pela mensagem! 😊"];
        const reply: Message = {
          id: `m${Date.now() + 1}`,
          fromId: toId,
          fromName: toUser.name,
          fromInitials: toUser.initials,
          fromColor: toUser.color,
          toId: currentUser.id,
          content: replies[Math.floor(Math.random() * replies.length)],
          createdAt: new Date(),
        };
        setMessages(prev => [...prev, reply]);
        setNotifications(prev => [{
          id: `n${Date.now()}`,
          type: "message" as const,
          fromName: toUser.name,
          fromInitials: toUser.initials,
          fromColor: toUser.color,
          content: "enviou uma mensagem",
          read: false,
          createdAt: new Date(),
        }, ...prev]);
      }, 2000);
    }
  }, [currentUser]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <BirdContext.Provider value={{
      currentUser, isLoggedIn, users: MOCK_USERS, posts, messages, notifications, followingIds,
      login, signup, logout, createPost, likePost, followUser, unfollowUser, sendMessage, markNotificationRead, unreadNotifications,
    }}>
      {children}
    </BirdContext.Provider>
  );
}

export function useBird() {
  const ctx = useContext(BirdContext);
  if (!ctx) throw new Error("useBird must be used within BirdProvider");
  return ctx;
}
