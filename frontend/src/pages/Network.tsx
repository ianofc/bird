import { BirdLayout } from "@/components/bird/BirdLayout";
import { useBird } from "@/contexts/BirdContext";
import { UserPlus, Users as UsersIcon, UserCheck, Megaphone, Sparkles } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "requests", label: "Solicitações", icon: UserPlus },
  { id: "connections", label: "Conexões (Amigos)", icon: UsersIcon },
  { id: "following", label: "Seguindo", icon: UserCheck },
  { id: "followers", label: "Seguidores", icon: Megaphone },
  { id: "suggestions", label: "Sugestões", icon: Sparkles },
];

const Network = () => {
  const bird = useBird() as {
    users?: Array<{
      id: string;
      color?: string;
      initials?: string;
      name?: string;
      handle?: string;
      bio?: string;
    }>;
    currentUser?: { id?: string } | null;
    followingIds?: string[];
    followUser?: (id: string) => void;
    unfollowUser?: (id: string) => void;
  };

  const users = bird.users ?? [];
  const currentUserId = bird.currentUser?.id;
  const followingIds = bird.followingIds ?? [];
  const followUser = bird.followUser ?? (() => undefined);
  const unfollowUser = bird.unfollowUser ?? (() => undefined);
  const [activeTab, setActiveTab] = useState("suggestions");

  const otherUsers = users.filter(u => u.id !== currentUserId);
  const followedUsers = otherUsers.filter(u => followingIds.includes(u.id));
  const suggestedUsers = otherUsers.filter(u => !followingIds.includes(u.id));

  return (
    <BirdLayout>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-foreground">Sua Rede</h1>
      </div>
      <p className="text-muted-foreground text-sm mb-6">Gerencie suas conexões e descubra pessoas.</p>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Tabs */}
        <div className="bird-glass-strong rounded-2xl p-4 md:w-56 shrink-0 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                activeTab === tab.id
                  ? "text-primary font-semibold"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "suggestions" && (
            <div className="space-y-3">
              {suggestedUsers.length === 0 ? (
                <div className="bird-glass rounded-2xl py-12 text-center text-muted-foreground">Nenhuma sugestão no momento.</div>
              ) : (
                suggestedUsers.map(user => (
                  <div key={user.id} className="bird-glass-strong rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className={`w-12 h-12 rounded-full ${user.color} flex items-center justify-center text-sm font-bold`}>{user.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.handle}</p>
                      {user.bio && <p className="text-xs text-muted-foreground mt-1">{user.bio}</p>}
                    </div>
                    <button onClick={() => followUser(user.id)} className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90">
                      Seguir
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "following" && (
            <div className="space-y-3">
              {followedUsers.length === 0 ? (
                <div className="bird-glass rounded-2xl py-12 text-center text-muted-foreground">Você ainda não segue ninguém.</div>
              ) : (
                followedUsers.map(user => (
                  <div key={user.id} className="bird-glass-strong rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                    <div className={`w-12 h-12 rounded-full ${user.color} flex items-center justify-center text-sm font-bold`}>{user.initials}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.handle}</p>
                    </div>
                    <button onClick={() => unfollowUser(user.id)} className="px-4 py-2 rounded-full border border-border text-sm font-semibold hover:bg-secondary text-foreground">
                      Seguindo
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {(activeTab === "requests" || activeTab === "connections" || activeTab === "followers") && (
            <div className="bird-glass rounded-2xl py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-3">
                <UsersIcon className="w-6 h-6 text-muted-foreground/60" />
              </div>
              <p className="text-muted-foreground text-sm">
                {activeTab === "requests" ? "Nenhuma solicitação pendente." :
                 activeTab === "connections" ? "Nenhuma conexão ainda." :
                 "Nenhum seguidor ainda."}
              </p>
            </div>
          )}
        </div>
      </div>
    </BirdLayout>
  );
};

export default Network;
