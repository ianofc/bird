import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

export function StoriesBar() {
  const stories = [
    { id: 1, user: "Você", img: undefined, isUser: true },
    { id: 2, user: "Elon", img: "https://github.com/shadcn.png" },
    { id: 3, user: "Bill", img: undefined },
    { id: 4, user: "Lívia", img: undefined },
    { id: 5, user: "Diego", img: undefined },
    { id: 6, user: "Filipe", img: undefined },
  ];

  return (
    <div className="w-full mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-5 p-2 items-start">
          
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group">
            <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-indigo-300 p-[3px] group-hover:scale-105 transition-transform relative">
               <div className="w-full h-full bg-white/60 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                  <Plus className="w-6 h-6 text-indigo-600" />
               </div>
               <div className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-1 border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
               </div>
            </div>
            <span className="text-xs font-medium text-gray-600">Story</span>
          </div>

          {stories.filter(s => !s.isUser).map((story) => (
            <Link key={story.id} to="/profile" className="flex flex-col items-center gap-1.5 cursor-pointer group">
              <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-600 group-hover:scale-105 transition-transform shadow-sm">
                <div className="w-full h-full rounded-full border-[3px] border-[#f0f2f5] overflow-hidden bg-gray-200">
                    {story.img ? (
                        <img src={story.img} alt={story.user} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white text-sm font-bold text-gray-400">
                            {story.user[0]}
                        </div>
                    )}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 max-w-[60px] truncate text-center group-hover:text-indigo-600 transition-colors">
                {story.user}
              </span>
            </Link>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}