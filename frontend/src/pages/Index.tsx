import { useState, useEffect } from "react";
import { BirdLayout } from "@/components/bird/BirdLayout";
import { PostComposer } from "@/components/bird/PostComposer";
import { PostCard } from "@/components/bird/PostCard";
import { StoriesBar } from "@/components/bird/StoriesBar";
import { EmptyFeed } from "@/components/bird/EmptyFeed";
import { toast } from "sonner";

// Interface rigorosa para bater com o que o PostCard espera
export interface Post {
  id: string;
  content: string;
  author: {
    name: string;
    handle: string;
    avatar?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  createdAt: string;
  liked?: boolean;
}

export default function Index() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeed() {
      try {
        // Simulação de carregamento para validar o layout
        setPosts([
          {
            id: "1",
            content: "O sistema BIRD está oficialmente operacional. Soberania e Inteligência ativadas! 🦅",
            author: {
              name: "Sistema BIRD",
              handle: "bird_admin",
              avatar: "https://github.com/shadcn.png"
            },
            likes: 150,
            comments: 12,
            shares: 8,
            createdAt: new Date().toISOString(),
            liked: true
          },
          {
            id: "2",
            content: "Módulo de autenticação estabilizado após a grande purga dos bugs. 🚀",
            author: {
              name: "Ian Santos",
              handle: "iansantos",
            },
            likes: 85,
            comments: 5,
            shares: 2,
            createdAt: new Date().toISOString(),
            liked: false
          }
        ]);
      } catch (error) {
        console.error("Erro ao carregar feed:", error);
        toast.error("Não foi possível carregar as atualizações.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFeed();
  }, []);

  return (
    <BirdLayout>
      <div className="max-w-[650px] mx-auto pt-2">
        <StoriesBar />
        <PostComposer />
        
        <div className="space-y-4 pb-20 mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground animate-pulse">Sincronizando feed...</p>
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <EmptyFeed />
          )}
        </div>
      </div>
    </BirdLayout>
  );
}