import { BirdLayout } from "@/components/bird/BirdLayout";
import { Stories } from "@/components/bird/Stories";
import { PostComposer } from "@/components/bird/PostComposer";
import { EmptyFeed } from "@/components/bird/EmptyFeed";
import { RightSidebar } from "@/components/bird/RightSidebar";
import { PostCard } from "@/components/bird/PostCard";
import { useBird } from "@/contexts/BirdContext";

const Index = () => {
  const { posts } = useBird();

  return (
    <BirdLayout rightSidebar={<RightSidebar />}>
      <Stories />
      <PostComposer />
      {posts.length === 0 ? (
        <EmptyFeed />
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </BirdLayout>
  );
};

export default Index;
