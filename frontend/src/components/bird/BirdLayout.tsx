import { ReactNode } from "react";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BirdLayout({ children }: { children: ReactNode }) {
  return (
    // Removido bg-[#f0f2f5], agora o body (Aurora) vai aparecer
    <div className="min-h-screen flex justify-center overflow-hidden relative">
      
      <div className="w-full max-w-[1400px] flex h-screen gap-6 md:px-4">
        
        {/* LEFT SIDEBAR: Centralizada Verticalmente */}
        <aside className="hidden md:flex flex-col w-[80px] h-full justify-center py-4 z-50 sticky top-0">
           <LeftSidebar />
        </aside>

        {/* MAIN FEED: Transparente para mostrar a Aurora */}
        <main className="flex-1 h-full relative z-10 overflow-hidden">
           <ScrollArea className="h-full w-full pr-4">
             <div className="pb-24 pt-4 md:pb-0">
               {children}
             </div>
           </ScrollArea>
        </main>

        {/* RIGHT SIDEBAR: Fixa e Scrollável */}
        <aside className="hidden lg:flex flex-col w-[350px] h-full z-20 py-4 overflow-y-auto scrollbar-hide">
          <RightSidebar />
        </aside>

      </div>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-white/80 backdrop-blur-xl border border-white/50 rounded-full flex justify-around items-center px-4 z-50 shadow-2xl">
          <LeftSidebar mobile />
      </div>
    </div>
  );
}