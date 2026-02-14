import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { useBird, Post } from "@/contexts/BirdContext";

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "agora";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function PostCard({ post }: { post: Post }) {
  const { likePost } = useBird();

  return (
    <div className="bird-glass-strong rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${post.userColor} flex items-center justify-center text-sm font-bold shrink-0`}>
          {post.userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-foreground">{post.userName}</span>
            <span className="text-xs text-muted-foreground">{post.userHandle}</span>
            <span className="text-xs text-muted-foreground">· {timeAgo(post.createdAt)}</span>
            <button className="ml-auto text-muted-foreground hover:text-foreground">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-foreground mb-3 whitespace-pre-wrap">{post.content}</p>
          {post.imageUrl && (
            <img src={post.imageUrl} alt="" className="rounded-xl mb-3 max-h-80 w-full object-cover" />
          )}
          <div className="flex items-center gap-6 text-muted-foreground">
            <button
              onClick={() => likePost(post.id)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${post.liked ? "text-destructive" : "hover:text-destructive"}`}
            >
              <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
              {post.likes > 0 && post.likes}
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
              <MessageCircle className="w-4 h-4" />
              {post.comments > 0 && post.comments}
            </button>
            <button className="flex items-center gap-1.5 text-xs hover:text-primary transition-colors">
              <Share2 className="w-4 h-4" />
              {post.shares > 0 && post.shares}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
