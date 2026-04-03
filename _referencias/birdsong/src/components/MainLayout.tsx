import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface MainLayoutProps {
  children: ReactNode;
  rightPanel?: ReactNode;
}

const MainLayout = ({ children, rightPanel }: MainLayoutProps) => {
  return (
    <div className="min-h-screen aurora-bg">
      <Sidebar />
      <div className="pl-4 pt-16 md:pt-6 md:pl-24 pr-4 md:pr-6 pb-6 flex gap-6 max-w-[1400px] mx-auto">
        <main className="flex-1 min-w-0 animate-fade-in">
          {children}
        </main>
        {rightPanel && (
          <aside className="w-80 shrink-0 hidden lg:block animate-fade-in">
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
