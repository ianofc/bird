import { Button } from "@/components/ui/button";
import { ImageIcon, Video, Smile, Send } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useBird } from "@/contexts/BirdContext";
import { useState } from "react";

export function PostComposer() {
  const { currentUser, createPost } = useBird();
  const [content, setContent] = useState("");

  const handlePost = () => {
    if (content.trim()) {
      createPost(content);
      setContent("");
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] p-5 shadow-sm border border-white/50 mb-6 group transition-all hover:bg-white/80">
      <div className="flex gap-4">
        <Avatar className="h-11 w-11 cursor-pointer hover:opacity-90 transition-opacity">
          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
            {currentUser?.initials || "IA"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <textarea
            className="w-full bg-transparent border-none focus:ring-0 resize-none text-[16px] text-gray-800 placeholder:text-gray-500 min-h-[50px] p-0 mt-2 font-medium"
            placeholder="No que você está pensando?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          
          <div className="flex items-center justify-between mt-3 border-t border-gray-200/50 pt-3">
            <div className="flex gap-1">
               <Button variant="ghost" size="icon" className="rounded-full text-indigo-500 hover:bg-indigo-50"><ImageIcon className="w-5 h-5" /></Button>
               <Button variant="ghost" size="icon" className="rounded-full text-indigo-500 hover:bg-indigo-50"><Video className="w-5 h-5" /></Button>
               <Button variant="ghost" size="icon" className="rounded-full text-indigo-500 hover:bg-indigo-50"><Smile className="w-5 h-5" /></Button>
            </div>
            
            <Button 
                onClick={handlePost}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 h-9 font-semibold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
            >
               Publicar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}