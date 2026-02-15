import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { useLocation } from "react-router-dom";

export function BirdLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen w-full flex justify-center bg-transparent">
      <div className="flex w-full max-w-[1300px] relative">
        <div className="hidden md:block w-[100px] shrink-0">
          <LeftSidebar />
        </div>
        <main className="flex-1 min-w-0">
          <div className={`mx-auto px-4 py-4 transition-all duration-500 ${isHomePage ? 'max-w-[650px]' : 'max-w-[1000px]'}`}>
            {children}
          </div>
        </main>
        {isHomePage && (
          <div className="hidden lg:block w-[350px] shrink-0 border-l border-white/20">
            <RightSidebar />
          </div>
        )}
      </div>
    </div>
  );
}