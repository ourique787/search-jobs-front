export type Senioridade =
  | "ESTAGIARIO"
  | "JUNIOR"
  | "PLENO"
  | "SENIOR"
  | "NAO_INFORMADO";

export const SENIORIDADE_DISPLAY: Record<Senioridade, string> = {
  ESTAGIARIO: "Estágio",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  NAO_INFORMADO: "Não Informado",
};

export const SENIORIDADE_FROM_DISPLAY: Record<string, Senioridade> = {
  Estágio: "ESTAGIARIO",
  Júnior: "JUNIOR",
  Pleno: "PLENO",
  Sênior: "SENIOR",
};

export interface Stack {
  id: number;
  nome: string;
}

export interface Job {
  id: number;
  titulo: string;
  empresa: string;
  descricao: string;
  linkOriginal: string;
  fonte: string;
  senioridade: Senioridade;
  dataColeta: string;
  stacksRequisitadas: Stack[];
}

export interface AuthResponse {
  token: string;
  email: string;
  nome: string;
}

export interface RelatorioFiltrosAplicados {
  dataInicio: string;
  dataFim: string;
  stacks: string[];
  senioridades: string[];
}

export interface RelatorioDistribuicaoTemporal {
  porMes: Record<string, number>;
  porDiaDaSemana: Record<string, number>;
}

export interface RelatorioResumo {
  totalCandidaturas: number;
  porFonte: Record<string, number>;
  porSenioridade: Record<string, number>;
  porStack: Record<string, number>;
  porStatus: Record<string, number>;
  distribuicaoTemporal: RelatorioDistribuicaoTemporal;
}

export interface RelatorioCandidaturaItem {
  vagaId: number;
  titulo: string;
  empresa: string;
  fonte: string;
  senioridade: Senioridade | null;
  stacks: string[];
  linkOriginal: string;
  status: string;
  dataInteracao: string;
}

export interface RelatorioDTO {
  nomeUsuario: string;
  emailUsuario: string;
  geradoEm: string;
  filtrosAplicados: RelatorioFiltrosAplicados;
  resumo: RelatorioResumo;
  candidaturas: RelatorioCandidaturaItem[];
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  senioridadeAlvo?: Senioridade;
}
