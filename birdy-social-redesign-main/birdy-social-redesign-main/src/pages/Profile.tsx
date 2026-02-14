import { BirdLayout } from "@/components/bird/BirdLayout";
import { useBird } from "@/contexts/BirdContext";
import { Calendar, Settings, Feather } from "lucide-react";
import { useState } from "react";
import { PostComposer } from "@/components/bird/PostComposer";
import { PostCard } from "@/components/bird/PostCard";

const Profile = () => {
  const { currentUser, posts, followingIds } = useBird();
  const [tab, setTab] = useState<"timeline" | "about">("timeline");
  const myPosts = posts.filter(p => p.userId === currentUser.id);

  return (
    <BirdLayout>
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-16">
        <div className="h-48 bg-gradient-to-r from-purple-400 via-pink-300 to-rose-300" />
        <div className="absolute -bottom-12 left-6">
          <div className={`w-24 h-24 rounded-full ${currentUser.color} flex items-center justify-center text-3xl font-bold border-4 border-card shadow-lg`}>
            {currentUser.initials}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bird-glass-strong rounded-2xl p-6 mb-4 shadow-sm -mt-8 pt-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-foreground">{currentUser.name}</h1>
            <p className="text-sm text-muted-foreground">{currentUser.handle}</p>
          </div>
          <div className="flex gap-2">
            <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">Editar Identidade</button>
            <button className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-secondary">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        {currentUser.bio && <p className="text-sm text-foreground mb-3">{currentUser.bio}</p>}
        <div className="flex gap-4 text-sm">
          <span className="text-foreground"><strong>{currentUser.following}</strong> <span className="text-muted-foreground">seguindo</span></span>
          <span className="text-foreground"><strong>{currentUser.followers}</strong> <span className="text-muted-foreground">seguidores</span></span>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-4 border-t border-border pt-3">
          <button onClick={() => setTab("timeline")} className={`text-sm font-medium pb-1 ${tab === "timeline" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}>
            Linha do Tempo
          </button>
          <button onClick={() => setTab("about")} className={`text-sm font-medium pb-1 ${tab === "about" ? "text-foreground border-b-2 border-primary" : "text-muted-foreground"}`}>
            Showcase (Sobre)
          </button>
        </div>
      </div>

      {tab === "timeline" ? (
        <>
          {/* Details card + Composer side by side on desktop */}
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 mb-4">
            <div className="bird-glass rounded-2xl p-4">
              <p className="text-xs font-semibold text-primary mb-2">DETALHES</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Desde {currentUser.joinedDate}
              </div>
            </div>
            <PostComposer />
          </div>

          {myPosts.length === 0 ? (
            <div className="bird-glass rounded-2xl py-12 flex flex-col items-center text-center">
              <Feather className="w-10 h-10 text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium">O fluxo está silencioso.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myPosts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </>
      ) : (
        <div className="bird-glass-strong rounded-2xl p-8 text-center">
          <p className="text-muted-foreground">Nenhuma informação de showcase ainda.</p>
        </div>
      )}
    </BirdLayout>
  );
};

export default Profile;
