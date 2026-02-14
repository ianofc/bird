import { LeftSidebar } from "@/components/bird/LeftSidebar";
import { ReactNode } from "react";

export function BirdLayout({ children, rightSidebar }: { children: ReactNode; rightSidebar?: ReactNode }) {
  return (
    <div className="min-h-screen bird-gradient-bg">
      <LeftSidebar />
      <div className="flex justify-center gap-8 px-4 md:px-4 py-8 ml-0 md:ml-20 pt-16 md:pt-8">
        <main className="w-full max-w-[600px]">
          {children}
        </main>
        {rightSidebar && (
          <div className="hidden lg:block">
            {rightSidebar}
          </div>
        )}
      </div>
    </div>
  );
}
