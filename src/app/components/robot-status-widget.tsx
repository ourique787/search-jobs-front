import { Bot, Clock } from "lucide-react";

interface RobotStatusWidgetProps {
  jobCount: number;
}

export function RobotStatusWidget({ jobCount }: RobotStatusWidgetProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-accent" />
        <h3 className="font-semibold text-foreground text-sm sm:text-base">
          Status do Robô
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-accent rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-foreground">
            Sistema ativo
          </span>
        </div>

        <div className="bg-secondary rounded-lg p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              ÚLTIMA ATUALIZAÇÃO
            </span>
          </div>
          <p className="text-base sm:text-lg font-semibold text-foreground">
            Agora mesmo
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Vagas indexadas</span>
            <span className="font-semibold text-foreground">{jobCount}</span>
          </div>
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground">Próxima coleta</span>
            <span className="font-semibold text-accent">Em breve</span>
          </div>
        </div>
      </div>
    </div>
  );
}
