import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";

export function StoriesBar() {
  const stories = [
    { id: 1, user: "Você", img: undefined, isUser: true },
    { id: 2, user: "Elon", img: "https://github.com/shadcn.png" },
    { id: 3, user: "Bill", img: undefined },
    { id: 4, user: "Lívia", img: undefined },
    { id: 5, user: "Rocketseat", img: undefined },
    { id: 6, user: "Filipe", img: undefined },
  ];

  return (
    // SEM BG-WHITE, SEM BORDER, SEM SHADOW
    <div className="w-full px-1 mb-6">
      <ScrollArea className="w-full overflow-visible whitespace-nowrap">
        <div className="flex items-start p-1 space-x-5 w-max">
          
          {/* ITEM: VOCÊ */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-[68px] h-[68px] rounded-full border-2 border-dashed border-indigo-300 p-[3px] group-hover:scale-105 transition-transform relative bg-transparent">
               <div className="flex items-center justify-center w-full h-full rounded-full shadow-sm bg-white/40 backdrop-blur-sm">
                  <Plus className="w-6 h-6 text-indigo-600" />
               </div>
               <div className="absolute bottom-0 right-0 p-1 bg-indigo-600 border-2 border-white rounded-full">
                  <Plus className="w-3 h-3 text-white" />
               </div>
            </div>
            <span className="text-xs font-medium text-gray-500 transition-colors group-hover:text-indigo-600">Seu story</span>
          </div>

          {/* OUTROS STORIES */}
          {stories.filter(s => !s.isUser).map((story) => (
            <Link key={story.id} to="/profile" className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-[68px] h-[68px] rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-indigo-600 group-hover:scale-105 transition-transform shadow-md hover:shadow-lg">
                <div className="w-full h-full rounded-full border-[3px] border-white/80 overflow-hidden bg-white">
                    {story.img ? (
                        <img src={story.img} alt={story.user} className="object-cover w-full h-full" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-sm font-bold text-gray-400 bg-gray-50">
                            {story.user[0]}
                        </div>
                    )}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500 max-w-[64px] truncate text-center group-hover:text-indigo-600 transition-colors">
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