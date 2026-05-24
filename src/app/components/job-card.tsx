import { Briefcase, Calendar, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/services/api";

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  source: string;
  technologies: string[];
  seniority: string;
  collectedAt: string;
  linkOriginal?: string;
}

const seniorityColors: Record<string, string> = {
  Estágio: "bg-blue-100 text-blue-700 border-blue-200",
  Júnior: "bg-green-100 text-green-700 border-green-200",
  Pleno: "bg-purple-100 text-purple-700 border-purple-200",
  Sênior: "bg-orange-100 text-orange-700 border-orange-200",
};

const techColors = [
  "bg-accent/20 text-accent-foreground border-accent/40",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-cyan-100 text-cyan-700 border-cyan-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-pink-100 text-pink-700 border-pink-200",
];

export function JobCard({
  id,
  title,
  company,
  source,
  technologies,
  seniority,
  collectedAt,
  linkOriginal,
}: JobCardProps) {
  const handleViewDetails = async () => {
    try {
      await api.jobs.click(Number(id));
    } catch {
      // silencia erro — não bloqueia a navegação
    }
    if (linkOriginal) {
      window.open(linkOriginal, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="bg-card border border-border rounded-xl p-4 sm:p-6 shadow-sm transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 leading-tight">
            {title}
          </h3>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>{company}</span>
            </div>
            <span className="hidden sm:inline text-border">•</span>
            <span className="flex items-center gap-1">
              via{" "}
              <span className="font-medium text-primary bg-primary/5 px-2 py-0.5 rounded">
                {source}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {technologies.map((tech, index) => (
          <span
            key={tech}
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${
              techColors[index % techColors.length]
            }`}
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t border-border">
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{collectedAt}</span>
          </div>
          <span
            className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${
              seniorityColors[seniority] ?? seniorityColors["Pleno"]
            }`}
          >
            {seniority}
          </span>
        </div>
        <button
          onClick={handleViewDetails}
          disabled={!linkOriginal}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-lg transition-colors text-xs sm:text-sm font-medium"
        >
          Ver Detalhes
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
