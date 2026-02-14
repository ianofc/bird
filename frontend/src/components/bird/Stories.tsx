import { Plus } from "lucide-react";

const stories = [
  { id: "you", name: "Seu story", isAdd: true },
  { id: "1", name: "Ana Silva", initials: "AS", color: "bg-pink-400" },
  { id: "2", name: "Carlos M.", initials: "CM", color: "bg-blue-400" },
  { id: "3", name: "Julia R.", initials: "JR", color: "bg-emerald-400" },
  { id: "4", name: "Pedro L.", initials: "PL", color: "bg-amber-400" },
];

export function Stories() {
  return (
    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1.5 min-w-[64px] cursor-pointer group">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 ${
              story.isAdd
                ? "border-2 border-dashed border-muted-foreground/40"
                : "ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
            }`}
          >
            {story.isAdd ? (
              <div className="relative w-full h-full rounded-full bg-secondary flex items-center justify-center">
                <Plus className="w-5 h-5 text-muted-foreground" />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </div>
              </div>
            ) : (
              <div className={`w-full h-full rounded-full ${story.color} flex items-center justify-center text-white text-sm font-semibold`}>
                {story.initials}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[64px]">{story.name}</span>
        </div>
      ))}
    </div>
  );
}
