import { Image, Video, Smile, Send } from "lucide-react";
import { useState, useRef } from "react";
import { useBird } from "@/contexts/BirdContext";

export function PostComposer() {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { createPost, currentUser } = useBird();

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = () => {
    if (!text.trim() && !imagePreview) return;
    createPost(text.trim(), imagePreview || undefined);
    setText("");
    setImagePreview(null);
  };

  return (
    <div className="bird-glass-strong rounded-2xl p-5 mb-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full ${currentUser.color} flex items-center justify-center font-bold text-sm shrink-0`}>
          {currentUser.initials}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="No que você está pensando?"
          className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground min-h-[40px] pt-2"
          rows={2}
        />
      </div>
      {imagePreview && (
        <div className="relative mb-3 ml-13">
          <img src={imagePreview} alt="Preview" className="rounded-xl max-h-48 object-cover" />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/60 text-background flex items-center justify-center text-xs font-bold"
          >
            ×
          </button>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-3">
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <button onClick={() => fileRef.current?.click()} className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors text-primary">
            <Image className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors text-destructive">
            <Video className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center transition-colors text-amber-500">
            <Smile className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={handlePublish}
          disabled={!text.trim() && !imagePreview}
          className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
        >
          Publicar <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
