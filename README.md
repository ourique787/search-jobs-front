# 🔍 Search Jobs — Frontend
 
Interface web da plataforma **Search Jobs**, uma solução de curadoria inteligente de vagas de TI que centraliza oportunidades de múltiplos portais, categoriza por stack e senioridade e oferece recomendações personalizadas ao profissional.
 
🔗 **Acesso ao sistema:** [https://search-jobs-front.vercel.app](https://search-jobs-front.vercel.app)  
🔗 **Repositório do backend:** [https://github.com/ourique787/search-jobs-back](https://github.com/ourique787/search-jobs-back)
 
---
 
## 📋 Sobre o projeto
 
O Search Jobs nasceu da necessidade de centralizar a busca por vagas de tecnologia, eliminando o trabalho de acessar manualmente portais como **InfoJobs**, **empregos.com.br**, **trampos.co** e **Gupy**. O frontend consome a API REST do backend e oferece ao usuário uma experiência organizada para buscar, filtrar e acompanhar candidaturas.
 
---
 
## ✨ Funcionalidades
 
- **Cadastro e autenticação** de usuários (e-mail/senha)
- **Perfil com preferências** — o usuário define suas stacks e nível de senioridade-alvo
- **Listagem de vagas recomendadas** com base nas preferências do perfil
- **Busca e filtros** por stack e senioridade
- **Redirecionamento externo** para a plataforma de origem ao clicar na vaga
- **Registro automático de candidatura** ao clicar em uma vaga
- **Dashboard de relatórios** com histórico de candidaturas e stacks mais demandadas
- **Recuperação de senha** via e-mail (SendGrid)
---
 
## 🛠️ Tecnologias
 
| Tecnologia | Uso |
|---|---|
| [React](https://react.dev) | Biblioteca principal de UI |
| [TypeScript](https://www.typescriptlang.org) | Tipagem estática |
| [Vite](https://vitejs.dev) | Bundler e servidor de desenvolvimento |
| [Tailwind CSS](https://tailwindcss.com) | Estilização |
| [Vercel](https://vercel.com) | Deploy e hospedagem |
 
---
 
## 🚀 Como rodar localmente
 
### Pré-requisitos
 
- Node.js 18+
- npm ou yarn
- Backend rodando localmente ou apontando para o ambiente publicado
### Instalação
 
```bash
# Clone o repositório
git clone https://github.com/ourique787/search-jobs-front.git
cd search-jobs-front
 
# Instale as dependências
npm install
```
 
### Variáveis de ambiente
 
Crie um arquivo `.env` na raiz do projeto:
 
```env
VITE_API_URL=http://localhost:8080
```
 
> Para apontar para o backend publicado, use `https://search-jobs-back.onrender.com`
 
### Rodando o projeto
 
```bash
npm run dev
```
 
Acesse [http://localhost:5173](http://localhost:5173) no navegador.
 
---
 
## 📁 Estrutura de pastas
 
```
src/
├── components/       # Componentes reutilizáveis
├── pages/            # Páginas da aplicação
├── services/         # Chamadas à API (axios/fetch)
├── hooks/            # Custom hooks
├── types/            # Tipagens TypeScript
└── assets/           # Imagens e arquivos estáticos
```
 
> Ajuste a estrutura acima conforme a organização real do seu projeto.
 
---
 
## 🌐 Deploy
 
O frontend está hospedado na **Vercel** e é atualizado automaticamente a cada push na branch `main`.
 
🔗 [https://search-jobs-front.vercel.app](https://search-jobs-front.vercel.app)
 
> **Atenção:** o backend está hospedado no plano gratuito do Render e pode entrar em modo hibernação após períodos de inatividade. Na primeira requisição, aguarde alguns segundos para o serviço retomar.
 
---
 
## 🔗 Repositórios relacionados
 
- [search-jobs-back](https://github.com/ourique787/search-jobs-back) — API REST (Spring Boot)
---
 
## 👨‍💻 Autor
 
**Lucas Ourique Trajano**  
Trabalho de Conclusão de Curso — Análise e Desenvolvimento de Sistemas  
ULBRA Torres/RS — 2026
 
