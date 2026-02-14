import { Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function StoriesBar() {
  const stories = [
    { id: 1, user: "Você", img: undefined, isUser: true },
    { id: 2, user: "Elon Musk", img: "https://github.com/shadcn.png" },
    { id: 3, user: "Bill Gates", img: undefined },
    { id: 4, user: "Lívia", img: undefined },
    { id: 5, user: "Rocketseat", img: undefined },
    { id: 6, user: "Filipe", img: undefined },
  ];

  return (
    <div className="w-full bg-white rounded-[2rem] p-4 shadow-sm border border-gray-100 mb-6">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex w-max space-x-4 p-1">
          
          {/* Adicionar Story */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-purple-300 p-1 group-hover:scale-105 transition-transform relative">
               <div className="w-full h-full bg-gray-50 rounded-full flex items-center justify-center">
                  <Plus className="w-6 h-6 text-purple-600" />
               </div>
               <div className="absolute bottom-0 right-0 bg-purple-600 rounded-full p-0.5 border-2 border-white">
                  <Plus className="w-3 h-3 text-white" />
               </div>
            </div>
            <span className="text-xs font-medium text-gray-600">Seu story</span>
          </div>

          {/* Outros Stories */}
          {stories.filter(s => !s.isUser).map((story) => (
            <div key={story.id} className="flex flex-col items-center gap-2 cursor-pointer group">
              <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full border-[2px] border-white overflow-hidden bg-gray-200">
                    {story.img ? (
                        <img src={story.img} alt={story.user} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs font-bold text-gray-400">
                            {story.user[0]}
                        </div>
                    )}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 w-16 truncate text-center">
                {story.user}
              </span>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}