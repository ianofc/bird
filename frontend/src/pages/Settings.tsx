import { BirdLayout } from "@/components/bird/BirdLayout";
import { Settings as SettingsIcon } from "lucide-react";

const SettingsPage = () => {
  return (
    <BirdLayout>
      <h1 className="text-2xl font-bold text-foreground mb-2">Configurações</h1>
      <p className="text-muted-foreground text-sm mb-6">Gerencie suas preferências.</p>

      <div className="space-y-4">
        {["Conta", "Privacidade", "Notificações", "Aparência", "Sobre"].map(section => (
          <div key={section} className="bird-glass-strong rounded-2xl p-5 shadow-sm flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors">
            <span className="font-medium text-foreground">{section}</span>
            <SettingsIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        ))}
      </div>
    </BirdLayout>
  );
};

export default SettingsPage;
