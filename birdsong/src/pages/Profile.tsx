import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Settings, Camera } from "lucide-react";
import PostComposer from "@/components/PostComposer";
import PostCard from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("posts")
      .select("id, content, image_url, likes_count, comments_count, created_at, user_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPosts((data || []).map(post => ({ ...post, profiles: { username: profile?.username, display_name: profile?.display_name, avatar_url: profile?.avatar_url } })));
  }, [user]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchPosts();
  }, [user, navigate, fetchPosts]);

  if (!user || !profile) return null;

  const initials = (profile.display_name || profile.username).slice(0, 2).toUpperCase();
  const joinYear = new Date(user.created_at || Date.now()).getFullYear();

  return (
    <div className="min-h-screen aurora-bg">
      <Sidebar />
      <div className="pl-4 pt-16 md:pt-6 md:pl-24 pr-4 md:pr-6 pb-6 max-w-[1000px] mx-auto animate-fade-in">
        {/* Cover */}
        <div className="gradient-cover rounded-2xl h-36 md:h-48 relative">
          <button className="absolute top-4 right-4 glass text-foreground text-xs font-semibold px-4 py-2 rounded-full flex items-center gap-1.5">
            <Camera size={14} /> ALTERAR VIBE
          </button>
        </div>

        {/* Profile card */}
        <div className="glass-strong rounded-2xl p-4 md:p-6 -mt-12 md:-mt-16 mx-2 md:mx-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl md:text-3xl font-bold border-4 border-card -mt-14 md:-mt-16 shadow-lg">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
              ) : initials}
            </div>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold text-foreground">{profile.display_name || profile.username}</h1>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-primary text-primary-foreground px-4 md:px-5 py-2 rounded-full font-semibold text-sm">
                Editar Identidade
              </button>
              <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-secondary transition-colors">
                <Settings size={16} />
              </button>
            </div>
          </div>

          <div className="flex gap-6 mt-6 border-t border-border pt-4">
            <button className="font-semibold text-foreground border-b-2 border-primary pb-1 text-sm md:text-base">Linha do Tempo</button>
            <button className="text-muted-foreground hover:text-foreground transition-colors pb-1 text-sm md:text-base">Showcase (Sobre)</button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row gap-6 mt-6 mx-2 md:mx-6">
          <div className="w-full md:w-64 shrink-0">
            <div className="glass-strong rounded-2xl p-5">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider">DETALHES</h3>
              <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                <Calendar size={14} />
                <span>Desde {joinYear}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <PostComposer onPostCreated={fetchPosts} />
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard
                  key={post.id}
                  id={post.id}
                  author={post.profiles?.display_name || post.profiles?.username || profile.username}
                  handle={post.profiles?.username || profile.username}
                  time={post.created_at}
                  content={post.content}
                  likes={post.likes_count}
                  comments={post.comments_count}
                  avatar={post.profiles?.avatar_url}
                  image_url={post.image_url}
                />
              ))
            ) : (
              <div className="aurora-card rounded-2xl p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">👻</div>
                <p className="text-muted-foreground">O fluxo está silencioso.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
