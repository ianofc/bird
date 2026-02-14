import { useState } from "react";
import { Image, Video, Smile, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PostComposerProps {
  onPostCreated?: () => void;
}

const PostComposer = ({ onPostCreated }: PostComposerProps) => {
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const { user, profile } = useAuth();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePost = async () => {
    if (!text.trim() || !user) return;
    setPosting(true);

    try {
      let imageUrl: string | null = null;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("post-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: text.trim(),
        image_url: imageUrl,
      });

      if (error) throw error;

      setText("");
      setImageFile(null);
      setImagePreview(null);
      onPostCreated?.();
      toast.success("Publicado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao publicar");
    } finally {
      setPosting(false);
    }
  };

  if (!user) return null;

  const initials = profile?.display_name?.slice(0, 2).toUpperCase() || profile?.username?.slice(0, 2).toUpperCase() || "?";

  return (
    <div className="glass-strong rounded-2xl p-5 shadow-sm">
      <div className="flex gap-3 items-start">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
          ) : initials}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="No que você está pensando?"
          className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground min-h-[40px] pt-2 font-medium"
          rows={2}
        />
      </div>

      {imagePreview && (
        <div className="mt-3 relative">
          <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 object-cover" />
          <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-foreground/70 text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex gap-1">
          <label className="w-9 h-9 rounded-lg flex items-center justify-center text-primary hover:bg-secondary transition-colors cursor-pointer">
            <Image size={18} />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          </label>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-destructive hover:bg-secondary transition-colors">
            <Video size={18} />
          </button>
          <button className="w-9 h-9 rounded-lg flex items-center justify-center text-amber-500 hover:bg-secondary transition-colors">
            <Smile size={18} />
          </button>
        </div>
        <button
          onClick={handlePost}
          disabled={!text.trim() || posting}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 disabled:opacity-50"
        >
          {posting ? "..." : "Publicar"} <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default PostComposer;
