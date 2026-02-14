import { BirdLayout } from "@/components/bird/BirdLayout";
import { RightSidebar } from "@/components/bird/RightSidebar";
import { useBird } from "@/contexts/BirdContext";
import { PostCard } from "@/components/bird/PostCard";
import { Search, TrendingUp, Hash } from "lucide-react";
import { useState } from "react";

const trendingTags = [
  { tag: "#AuroraDesign", category: "Tecnologia", posts: "54.2K" },
  { tag: "#ReactDev", category: "Programação", posts: "32.1K" },
  { tag: "#IndieDevs", category: "Games", posts: "8.1K" },
  { tag: "#Django5", category: "Brasil", posts: "12K" },
  { tag: "#OpenSource", category: "Tecnologia", posts: "28.5K" },
  { tag: "#DesignSystem", category: "UI/UX", posts: "15.3K" },
];

const Explore = () => {
  const { posts } = useBird();
  const [search, setSearch] = useState("");

  const filteredPosts = search
    ? posts.filter(p => p.content.toLowerCase().includes(search.toLowerCase()))
    : posts;

  return (
    <BirdLayout rightSidebar={<RightSidebar />}>
      <h1 className="text-2xl font-bold text-foreground mb-2">Explorar</h1>
      <p className="text-muted-foreground text-sm mb-6">Descubra o que está em alta no Bird.</p>

      {/* Search */}
      <div className="bird-glass-strong rounded-full flex items-center gap-2 px-4 py-3 mb-6 shadow-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar posts, hashtags, pessoas..."
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
        />
      </div>

      {/* Trending */}
      <div className="mb-6">
        <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> Em Alta
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {trendingTags.map(item => (
            <div key={item.tag} className="bird-glass-strong rounded-xl p-3 cursor-pointer hover:bg-secondary/50 transition-colors shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-semibold">{item.category}</span>
              </div>
              <p className="font-bold text-sm text-foreground">{item.tag}</p>
              <p className="text-xs text-muted-foreground">{item.posts} posts</p>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      <h2 className="font-bold text-foreground mb-3">Posts recentes</h2>
      {filteredPosts.length === 0 ? (
        <div className="bird-glass rounded-2xl py-12 text-center text-muted-foreground text-sm">
          {search ? "Nenhum resultado encontrado." : "Nenhum post ainda."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </BirdLayout>
  );
};

export default Explore;
