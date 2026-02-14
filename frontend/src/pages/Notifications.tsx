import { BirdLayout } from "@/components/bird/BirdLayout";
import { useBird } from "@/contexts/BirdContext";
import { Bell, Heart, UserPlus, MessageCircle, Check } from "lucide-react";

const iconMap = {
  like: Heart,
  follow: UserPlus,
  message: MessageCircle,
};

const Notifications = () => {
  const { notifications, markNotificationRead } = useBird();

  return (
    <BirdLayout>
      <h1 className="text-2xl font-bold text-foreground mb-2">Notificações</h1>
      <p className="text-muted-foreground text-sm mb-6">Fique por dentro de tudo.</p>

      {notifications.length === 0 ? (
        <div className="bird-glass rounded-2xl py-16 flex flex-col items-center text-center">
          <Bell className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Nenhuma notificação ainda.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const Icon = iconMap[n.type];
            return (
              <div
                key={n.id}
                className={`bird-glass-strong rounded-xl p-4 flex items-center gap-3 shadow-sm cursor-pointer transition-colors ${
                  !n.read ? "border-l-4 border-primary" : ""
                }`}
                onClick={() => markNotificationRead(n.id)}
              >
                <div className={`w-10 h-10 rounded-full ${n.fromColor} flex items-center justify-center text-sm font-bold shrink-0`}>
                  {n.fromInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <strong>{n.fromName}</strong> {n.content}
                  </p>
                </div>
                <Icon className={`w-4 h-4 shrink-0 ${n.type === "like" ? "text-destructive" : n.type === "follow" ? "text-primary" : "text-muted-foreground"}`} />
                {n.read && <Check className="w-3 h-3 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      )}
    </BirdLayout>
  );
};

export default Notifications;
