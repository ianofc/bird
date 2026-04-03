import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  mobile?: boolean;
  badge?: number;
}

export function NavLink({ to, icon: Icon, label, mobile, badge }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;

  if (mobile) {
    return (
      <Link to={to} className={cn("p-2 rounded-full transition-colors", isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-400")}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link to={to} className="group relative flex items-center justify-center w-12 h-12">
          <div className={cn(
            "absolute inset-0 rounded-full transition-all duration-300",
            isActive ? "bg-indigo-600 shadow-md shadow-indigo-200" : "group-hover:bg-white/80"
          )} />
          
          <Icon 
            size={22} 
            className={cn(
                "relative z-10 transition-colors duration-300",
                isActive ? "text-white" : "text-gray-500 group-hover:text-indigo-600"
            )} 
            strokeWidth={isActive ? 2.5 : 2}
          />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="bg-gray-900 text-white border-none rounded-lg ml-2 font-medium">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}