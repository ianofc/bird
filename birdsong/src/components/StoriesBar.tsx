import { Plus } from "lucide-react";

const stories = [
  { name: "Seu story", isSelf: true },
  { name: "ana_dev", color: "from-purple-400 to-pink-400" },
  { name: "lucas_ui", color: "from-blue-400 to-purple-400" },
  { name: "maria_js", color: "from-pink-400 to-orange-400" },
  { name: "pedro_py", color: "from-green-400 to-blue-400" },
  { name: "julia_rx", color: "from-amber-400 to-red-400" },
];

const StoriesBar = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
      {stories.map((story, i) => (
        <button key={i} className="flex flex-col items-center gap-1.5 shrink-0 group">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${
              story.isSelf
                ? "border-2 border-dashed border-muted-foreground/40"
                : `bg-gradient-to-br ${story.color} p-[2px]`
            }`}
          >
            {story.isSelf ? (
              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center relative">
                <Plus size={20} className="text-muted-foreground" />
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Plus size={12} />
                </div>
              </div>
            ) : (
              <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center text-foreground font-bold text-xs">
                {story.name.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors truncate w-16 text-center">
            {story.name}
          </span>
        </button>
      ))}
    </div>
  );
};

export default StoriesBar;
