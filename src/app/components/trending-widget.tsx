import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import type { Job } from "@/types";

const BAR_COLOR = "#4F46E5"; // --chart-1 / --primary

interface TrendingWidgetProps {
  jobs: Job[];
}

export function TrendingWidget({ jobs }: TrendingWidgetProps) {
  const { trendingData, maxCount } = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const job of jobs) {
      for (const stack of job.stacksRequisitadas) {
        counts[stack.nome] = (counts[stack.nome] ?? 0) + 1;
      }
    }
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    // maxCount calculado sobre os dados reais do top-3, não sobre trendingData[0]
    // — evita incorreções quando o sort é instável em empates
    const maxCount = sorted.reduce((m, [, c]) => Math.max(m, c), 1);
    return {
      trendingData: sorted.map(([tech, count]) => ({ tech, count })),
      maxCount,
    };
  }, [jobs]);

  if (trendingData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-display font-medium text-foreground text-sm sm:text-base">
            Tendências da Semana
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Sem dados disponíveis ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-display font-medium text-foreground text-sm sm:text-base">
          Tendências da Semana
        </h3>
      </div>

      <p className="text-xs sm:text-sm text-muted-foreground mb-4">
        Top {trendingData.length} stacks mais requisitadas
      </p>

      <div className="space-y-4">
        {trendingData.map((item, index) => (
          <div key={item.tech}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                <span className="font-mono font-medium text-foreground">{item.tech}</span>
              </div>
              <span className="text-sm font-mono text-primary">
                {item.count} vaga{item.count !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                  backgroundColor: BAR_COLOR,
                }}
              />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
