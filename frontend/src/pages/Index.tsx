import { BirdLayout } from "@/components/bird/BirdLayout";
import { PostComposer } from "@/components/bird/PostComposer";
import { PostCard } from "@/components/bird/PostCard";
import { StoriesBar } from "@/components/StoriesBar";
import { EmptyFeed } from "@/components/bird/EmptyFeed";
import { useBird } from "@/contexts/BirdContext";

export default function Index() {
  const { posts } = useBird();

  return (
    <BirdLayout>
      <div className="max-w-[600px] mx-auto pt-2">
        <StoriesBar />
        <PostComposer />
        
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <EmptyFeed />
          )}
        </div>
      </div>
    </BirdLayout>
  );
}