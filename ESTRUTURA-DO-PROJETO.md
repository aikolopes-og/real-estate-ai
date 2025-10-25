# 📁 ESTRUTURA DO PROJETO - ATUALIZADA

## Arquivos Importantes no Root

```
real-estate-ai/
├── 📘 CHECKLIST-EXECUCAO.md          ← COMECE AQUI! Checklist passo a passo
├── 📘 INSTRUCOES-LIMPEZA-COMPLETA.md ← Comandos detalhados
├── 📘 EXPLICACAO-DAS-TECNOLOGIAS-USADAS.md ← Entenda o projeto
├── 📘 RESUMO-DAS-ALTERACOES.md       ← O que foi mudado
├── 📘 SEED-CREDENTIALS-PLANO.txt     ← Credenciais planejadas
├── 📄 README.md                       ← Documentação original
├── 📄 docker-compose.yml              ← Config PostgreSQL
│
├── 📂 backend/                        ← API Node.js + Express
│   ├── 📄 package.json                ← Dependências backend
│   ├── 📄 tsconfig.json               ← Config TypeScript
│   │
│   ├── 📂 prisma/
│   │   ├── 📄 schema.prisma           ← SCHEMA DO BANCO (PropertyType só APARTMENT/HOUSE)
│   │   ├── 📜 seed.ts                 ← Seed básico (2 imóveis exemplo)
│   │   └── 📂 migrations/             ← Histórico de alterações do banco
│   │
│   ├── 📂 src/
│   │   ├── 📜 server.ts               ← Ponto de entrada do backend
│   │   │
│   │   ├── 📂 routes/
│   │   │   ├── 📜 auth.ts             ← Login, registro, logout
│   │   │   ├── 📜 properties.ts       ← CRUD imóveis + UPLOAD de imagens
│   │   │   ├── 📜 ai.ts               ← Recomendações (só APARTMENT/HOUSE)
│   │   │   ├── 📜 companies.ts        ← Empresas
│   │   │   └── 📜 admin.ts            ← Admin routes
│   │   │
│   │   ├── 📂 middleware/
│   │   │   ├── 📜 auth.ts             ← JWT authentication
│   │   │   ├── 📜 errorHandler.ts     ← Tratamento de erros
│   │   │   └── 📜 rateLimiter.ts      ← Rate limiting
│   │   │
│   │   ├── 📂 scripts/
│   │   │   └── 📜 seed-local-images.ts ← SEED COM SUAS IMAGENS (importante!)
│   │   │
│   │   └── 📂 utils/
│   │       └── 📜 logger.ts           ← Logging
│   │
│   └── 📂 uploads/                    ← Imagens dos imóveis (criado automaticamente)
│
└── 📂 main-app/                       ← Frontend Next.js + React
    ├── 📄 package.json                ← Dependências frontend
    ├── 📄 next.config.ts              ← Config Next.js
    ├── 📄 tailwind.config.js          ← Config Tailwind CSS
    │
    └── 📂 src/
        ├── 📂 app/                    ← Páginas (Next.js App Router)
        │   ├── 📜 page.tsx            ← Home
        │   ├── 📜 layout.tsx          ← Layout principal
        │   ├── 📄 globals.css         ← Estilos globais
        │   │
        │   ├── 📂 auth/
        │   │   ├── 📂 login/
        │   │   │   └── 📜 page.tsx    ← Página de login
        │   │   └── 📂 register/
        │   │       ├── 📂 client/
        │   │       │   └── 📜 page.tsx ← Cadastro cliente
        │   │       ├── 📂 broker/
        │   │       │   └── 📜 page.tsx ← Cadastro corretor
        │   │       └── 📂 company/
        │   │           └── 📜 page.tsx ← Cadastro construtora
        │   │
        │   ├── 📂 imoveis/
        │   │   └── 📜 page.tsx        ← Lista de imóveis
        │   │
        │   ├── 📂 cadastrar-imovel/
        │   │   └── 📜 page.tsx        ← FORMULÁRIO COM UPLOAD DE FOTOS
        │   │
        │   ├── 📂 profile/
        │   │   └── 📜 page.tsx        ← Perfil do usuário
        │   │
        │   └── 📂 recommendations/
        │       └── 📜 page.tsx        ← Recomendações
        │
        ├── 📂 components/
        │   ├── 📜 Header.tsx          ← Navbar (com botões condicionais)
        │   ├── 📜 Gallery.tsx         ← Galeria de imagens
        │   └── 📂 listings/
        │       ├── 📜 ListingCard.tsx ← Card de imóvel
        │       └── 📜 ListingGrid.tsx ← Grade de imóveis
        │
        ├── 📂 context/
        │   ├── 📜 AuthContext.tsx     ← Context de autenticação
        │   └── 📜 LoadingContext.tsx  ← Context de loading
        │
        ├── 📂 lib/
        │   └── 📜 api.ts              ← Cliente HTTP (fetch)
        │
        └── 📂 utils/
            └── 📜 logger.ts           ← Logging frontend
```

## 🎯 Arquivos Chave para Entender o Sistema

### 1. Backend (API)
| Arquivo | O que faz |
|---------|-----------|
| `backend/prisma/schema.prisma` | Define estrutura do banco (tabelas, relações, enums) |
| `backend/src/server.ts` | Inicializa servidor Express, registra rotas |
| `backend/src/routes/properties.ts` | CRUD de imóveis + endpoint de upload |
| `backend/src/routes/auth.ts` | Login, registro, refresh token |
| `backend/src/scripts/seed-local-images.ts` | **Popula banco com suas imagens locais** |

### 2. Frontend (Interface)
| Arquivo | O que faz |
|---------|-----------|
| `main-app/src/app/page.tsx` | Página inicial (home) |
| `main-app/src/app/cadastrar-imovel/page.tsx` | **Formulário de cadastro com upload** |
| `main-app/src/components/Header.tsx` | Barra superior (navbar) |
| `main-app/src/lib/api.ts` | Funções para chamar API do backend |
| `main-app/src/context/AuthContext.tsx` | Gerencia estado de login/logout |

### 3. Documentação (Você está aqui!)
| Arquivo | O que contém |
|---------|--------------|
| `CHECKLIST-EXECUCAO.md` | **Checklist passo a passo para rodar** |
| `INSTRUCOES-LIMPEZA-COMPLETA.md` | Comandos detalhados com troubleshooting |
| `EXPLICACAO-DAS-TECNOLOGIAS-USADAS.md` | Explicação didática de todas as tecnologias |
| `RESUMO-DAS-ALTERACOES.md` | Lista completa do que foi mudado |
| `SEED-CREDENTIALS-PLANO.txt` | Credenciais que serão criadas |

## 🗑️ Arquivos Removidos (Obsoletos)

Estes arquivos foram **deletados** porque continham tipos de imóvel extras:
- ❌ `backend/prisma/seed-goiania.ts`
- ❌ `backend/prisma/seed-large.ts`
- ❌ `backend/prisma/seed-full.ts`
- ❌ `backend/prisma/seed-completo.ts`
- ❌ `backend/prisma/verify-db.ts`
- ❌ `backend/src/scripts/seed-stress.ts`
- ❌ `backend/src/scripts/seed-test.ts`

## 🆕 Arquivos Novos Criados

### Backend
- ✅ `backend/src/scripts/seed-local-images.ts` - Seed customizado com suas imagens

### Documentação
- ✅ `CHECKLIST-EXECUCAO.md` - Checklist rápido
- ✅ `INSTRUCOES-LIMPEZA-COMPLETA.md` - Guia detalhado
- ✅ `EXPLICACAO-DAS-TECNOLOGIAS-USADAS.md` - Explicação técnica
- ✅ `RESUMO-DAS-ALTERACOES.md` - Changelog
- ✅ `ESTRUTURA-DO-PROJETO.md` - Este arquivo!

## 📊 Fluxo de Dados

```
┌─────────────┐
│  Navegador  │
│ (localhost: │
│    3000)    │
└──────┬──────┘
       │
       │ HTTP Requests
       │
       ▼
┌─────────────────────────────┐
│   Frontend (Next.js)        │
│                             │
│  - Páginas em src/app/      │
│  - Componentes em           │
│    src/components/          │
│  - API client em src/lib/   │
└──────────┬──────────────────┘
           │
           │ fetch() calls
           │ (api.ts)
           ▼
┌─────────────────────────────┐
│   Backend (Express)         │
│   (localhost:8001)          │
│                             │
│  - Rotas em src/routes/     │
│  - Upload em /uploads       │
│  - Validações com Zod       │
└──────────┬──────────────────┘
           │
           │ Prisma Client
           │
           ▼
┌─────────────────────────────┐
│   PostgreSQL Database       │
│   (localhost:5432)          │
│                             │
│  - Users (15)               │
│  - Companies (5)            │
│  - Properties (10)          │
│  - RefreshTokens, etc.      │
└─────────────────────────────┘
```

## 🎨 Tipos de Imóvel (Simplificado!)

Antes: 8 tipos ❌
- APARTMENT
- HOUSE
- CONDO
- TOWNHOUSE
- STUDIO
- LOFT
- COMMERCIAL
- LAND

Agora: 2 tipos ✅
- **APARTMENT** (Apartamento)
- **HOUSE** (Casa)

---

**Próximo passo**: Abra `CHECKLIST-EXECUCAO.md` e siga as instruções! 🚀
