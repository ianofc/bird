import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function PostCard({ post }: { post: any }) {
  return (
    <article className="glass-card p-5 mb-4 group hover:scale-[1.005] duration-300">
      <div className="flex gap-4">
        <Avatar className="cursor-pointer">
           <AvatarFallback className={`${post.userColor || 'bg-gray-200'} text-white font-bold`}>{post.userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
           <div className="flex justify-between items-start">
              <div>
                 <span className="font-bold text-gray-900 mr-2">{post.userName}</span>
                 <span className="text-gray-400 text-sm">{post.userHandle} · 2h</span>
              </div>
           </div>
           <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
           
           {post.imageUrl && (
             <div className="mt-3 rounded-xl overflow-hidden shadow-sm">
                <img src={post.imageUrl} className="w-full object-cover max-h-[500px]" alt="" />
             </div>
           )}

           <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/50">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-500 hover:bg-blue-50">
                 <MessageCircle className="w-4 h-4 mr-2" /> {post.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-pink-500 hover:bg-pink-50">
                 <Heart className="w-4 h-4 mr-2" /> {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-500 hover:bg-green-50">
                 <Share2 className="w-4 h-4 mr-2" />
              </Button>
           </div>
        </div>
      </div>
    </article>
  )
}