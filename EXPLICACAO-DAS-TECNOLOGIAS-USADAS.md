# Explicação das tecnologias usadas (didático)

Este projeto é uma plataforma imobiliária (EasyHome) composta por um frontend em Next.js + React e um backend em Node.js (Express) com banco de dados PostgreSQL usando Prisma ORM. Abaixo está uma explicação clara e simples do que cada parte faz, por que foi escolhida e o papel de arquivos/tecnologias auxiliares.

1) Frontend
- Next.js (React)
  - O que é: framework React para aplicações web com renderização híbrida (SSR, SSG, RSC).
  - Por que aqui: fornece rotas de arquivo, otimizações e ótima developer experience (Hot Reload, compilação rápida). Facilita SEO e indexação, importante para um produto local em Goiânia.
  - Onde está: `main-app/` (pasta principal do frontend). Arquivos-chave:
    - `src/app/` — rotas e páginas do Next.js (ex: `/auth`, `/imoveis`, `/cadastrar-imovel`, `/profile`).
    - `src/components/` — componentes reutilizáveis (Header, Gallery, ListingCard, etc.).
    - `src/lib/api.ts` — cliente HTTP para falar com o backend.
    - `src/context/AuthContext.tsx` — gerencia o estado de autenticação do usuário (tokens, login, logout).
  - Observações: usamos estilos com Tailwind (config em `tailwind.config.js`) e design glassmorphism.

2) Backend
- Node.js + Express
  - O que é: servidor HTTP que expõe uma API JSON (REST) para o frontend.
  - Por que: Simples, maduro e rápido de desenvolver. Integrado com middlewares (helmet, cors, morgan).
  - Onde está: `backend/src/`.
    - `src/server.ts` — inicialização do servidor e registro de rotas.
    - `src/routes/` — endpoints (auth, properties, companies, ai, admin).
    - `src/middleware/` — autenticação, tratamento de erros, rate limiter.
    - `src/utils/logger.ts` — logging local.
  - Uploads estáticos: o backend serve arquivos estáticos em `/uploads` (pasta `backend/uploads`). O endpoint `/api/properties/upload` foi criado para receber imagens via multipart/form-data e armazená-las.

3) Banco de dados
- PostgreSQL + Prisma ORM
  - O que é: PostgreSQL é banco relacional; Prisma é um ORM moderno que gera um cliente tipo-safe para TypeScript.
  - Onde está: schema Prisma em `backend/prisma/schema.prisma`.
  - Por que: Prisma facilita migrations, seeds e acesso simples ao banco com tipagem no TypeScript.
  - Observações: alteramos validações e estamos preparando mudanças para manter apenas dois tipos de imóvel (`APARTMENT`, `HOUSE`). Alterações no schema exigem rodar as migrations do Prisma.

4) Ferramentas auxiliares e scripts
- Multer: middleware para upload de arquivos (backend). Armazena imagens em `backend/uploads`.
- Scripts de seed (`backend/src/scripts/`): já existem e foram adicionados outros para popular dados com imagens locais. Um novo script `seed-local-images.ts` foi criado para copiar imagens de `C:\Users\folli\Pictures\img-imoveis` e popular o banco.
- Prisma CLI: `npx prisma migrate dev`, `npx prisma db push`, `npx prisma studio` — para migrar e inspecionar o banco.

5) Arquivos importantes e onde olhar
- `main-app/src/app/cadastrar-imovel/page.tsx` — formulário de cadastro de imóvel (agora permite selecionar imagens e faz upload para o backend).
- `main-app/src/components/Header.tsx` — barra superior (ajustada para roles: mostra "Cadastrar Imóvel" para corretores/construtoras e esconde "Recomendações" para esses roles).
- `backend/src/routes/properties.ts` — lógica de listagem, criação, atualização e exclusão de imóveis; validação via Zod e endpoint de upload usando multer.
- `backend/prisma/schema.prisma` — modelo do banco. Alterações de esquema exigem migrations.
- `backend/src/scripts/seed-local-images.ts` — script para copiar imagens locais e popular DB (exige `RUN_SEED_LOCAL=true` para executar com segurança).

6) Considerações de implantação e produção
- Variáveis de ambiente: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, etc., carregadas via `.env`.
- Storage de imagens: hoje usamos armazenamento local (`/uploads`). Para produção, recomenda-se S3 ou serviço similar.
- Segurança: JWT para autenticação; helmet, rate-limiter e validações com Zod.

7) Próximos passos recomendados
- Confirmar se quer que eu renomeie colunas/rotas para PT-BR no schema (operações destrutivas exigem backup e migração).
- Se confirmar a limpeza e re-população do banco, eu posso gerar o script completo e os arquivos que você executará localmente (copiar imagens, rodar seed).
- Para produção, mover uploads para um blob store (S3) e ajustar URLs.

Se quiser, eu já faço as alterações no schema (remover enums extras e renomear campos) e gero a migration + script de seed que você executa. Confirma que quer prosseguir com a exclusão/recriação dos dados do banco? Caso sim, eu aplico as mudanças e te passo os comandos exatos para executar (Windows PowerShell).