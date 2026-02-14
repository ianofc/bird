import { useEffect, useState, useCallback } from "react";
import MainLayout from "@/components/MainLayout";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import StoriesBar from "@/components/StoriesBar";
import RightSidebar from "@/components/RightSidebar";
import { Feather } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PostWithProfile {
  id: string;
  content: string;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
}

const Feed = () => {
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, content, image_url, likes_count, comments_count, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(50);

    // Fetch profiles for each unique user
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      const enriched = data.map(post => ({
        ...post,
        profiles: profileMap.get(post.user_id) || null,
      }));
      setPosts(enriched as any);
    } else {
      setPosts([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <MainLayout rightPanel={<RightSidebar />}>
      <div className="space-y-5">
        <StoriesBar />
        {user && <PostComposer onPostCreated={fetchPosts} />}
        
        {loading ? (
          <div className="glass-strong rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                author={post.profiles?.display_name || post.profiles?.username || "Anônimo"}
                handle={post.profiles?.username || "user"}
                time={post.created_at}
                content={post.content}
                likes={post.likes_count}
                comments={post.comments_count}
                avatar={post.profiles?.avatar_url}
                image_url={post.image_url}
              />
            ))}
          </div>
        ) : (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Feather size={28} className="text-primary/50" />
            </div>
            <p className="font-semibold text-foreground">Tudo quieto por aqui</p>
            <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a publicar algo!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Feed;
