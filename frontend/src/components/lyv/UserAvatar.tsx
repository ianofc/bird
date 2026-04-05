import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/contexts/LyvContext";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

interface UserAvatarProps {
  user: User | null | undefined;
  className?: string; // Para tamanhos (ex: h-12 w-12)
  showBadge?: boolean; // Se deve mostrar o ícone de coroa/estrela
  hoverEffect?: boolean;
}

export function UserAvatar({ user, className = "w-10 h-10", showBadge = false, hoverEffect = true }: UserAvatarProps) {
  const isPremium = user?.isPremium;

  // Lógica do Estilo
  const containerClasses = cn(
    "relative rounded-full transition-all duration-300",
    // Espessura do anel: 3px para premium, 2px para normal
    isPremium ? "p-[3px]" : "p-[2px]",
    // Classe base de tamanho vem do pai
    className,
    // Lógica Premium vs Standard (Cores)
    isPremium 
      ? "bg-gradient-to-tr from-amber-300 via-yellow-500 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.5)]" 
      : "bg-gradient-to-tr from-gray-100 to-gray-300 border border-white/10",
    // Hover effect
    hoverEffect && "hover:scale-105 cursor-pointer"
  );

  // Fallback para iniciais
  const initials = user?.initials || user?.name?.substring(0, 2).toUpperCase() || "??";

  return (
    <div className={containerClasses}>
      <Avatar className="w-full h-full bg-white border-2 border-white">
        <AvatarImage src={user?.avatar || undefined} className="object-cover" />
        <AvatarFallback className={cn(
          "font-bold bg-gray-50 flex items-center justify-center w-full h-full",
          // Texto dourado se premium, indigo se normal
          isPremium ? "text-amber-600" : "text-indigo-600",
          // Ajuste de fonte baseado no tamanho (hack simples para responsividade)
          className.includes("h-20") || className.includes("h-32") || className.includes("h-36") || className.includes("h-40") 
            ? "text-4xl" // Fonte grande para perfil
            : "text-xs"  // Fonte pequena para feed
        )}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Badge Flutuante Opcional (Selo) */}
      {isPremium && showBadge && (
        <div className="absolute -bottom-0.5 -right-0.5 bg-gradient-to-r from-amber-400 to-amber-200 text-white rounded-full p-[3px] border-[2.5px] border-white shadow-sm z-10 flex items-center justify-center">
          <Star className="w-2.5 h-2.5 fill-white" />
        </div>
      )}
    </div>
  );
}