# 📁 Estrutura do Projeto

## Árvore de Arquivos

```
.
├── 📄 README.md                    # Documentação principal do projeto
├── 📄 QUICKSTART.md                # Guia rápido (5 minutos)
├── 📄 SETUP_MINIO.md               # Configuração detalhada do MinIO
├── 📄 DEPLOY_GUIDE.md              # Guia de deploy em produção
├── 📄 BEST_PRACTICES.md            # Melhores práticas e extensões
├── 📄 DATABASE_SETUP.md            # Integração com banco de dados
├── 📄 PROJECT_STRUCTURE.md         # Este arquivo
├── 📄 .env.example                 # Exemplo de variáveis (público)
├── 📄 .env.local.example           # Exemplo para desenvolvimento
├── 📄 .gitignore
├── 📄 package.json                 # Dependências npm
├── 📄 tsconfig.json                # Configuração TypeScript
├── 📄 next.config.mjs              # Configuração Next.js
├── 📄 tailwind.config.ts           # Configuração Tailwind CSS
├── 📄 postcss.config.mjs           # Configuração PostCSS
│
├── 📂 app/
│   ├── 📄 layout.tsx               # Layout root da aplicação
│   ├── 📄 page.tsx                 # Página principal (/)
│   ├── 📄 globals.css              # Estilos globais e design tokens
│   ├── 📄 favicon.ico
│   └── 📂 api/
│       └── 📂 upload/
│           └── 📄 route.ts         # Endpoint POST /api/upload
│
├── 📂 components/
│   ├── 📄 header.tsx               # Header com logo e navegação
│   ├── 📄 file-dropzone.tsx        # Componente de upload (drag & drop)
│   ├── 📄 upload-history.tsx       # Componente de histórico de uploads
│   └── 📂 ui/
│       ├── 📄 card.tsx
│       ├── 📄 button.tsx
│       ├── 📄 input.tsx
│       ├── 📄 spinner.tsx
│       └── ... (outros componentes shadcn/ui)
│
├── 📂 lib/
│   ├── 📄 utils.ts                 # Utilidades (cn, formatFileSize, etc)
│   ├── 📄 minio-client.ts          # Cliente MinIO reutilizável
│   └── ... (outras bibliotecas conforme necessário)
│
├── 📂 __tests__/
│   └── 📄 upload.test.ts           # Testes unitários de upload
│
├── 📂 public/
│   └── 📄 images/
│       └── (imagens estáticas)
│
└── 📂 scripts/
    └── (scripts de automação, se necessário)
```

---

## 📄 Descrição dos Arquivos

### Configuração
| Arquivo | Propósito |
|---------|-----------|
| `package.json` | Dependências e scripts npm |
| `tsconfig.json` | Configuração TypeScript |
| `next.config.mjs` | Configuração Next.js |
| `tailwind.config.ts` | Temas e customizações Tailwind |
| `postcss.config.mjs` | Processamento CSS |

### Documentação
| Arquivo | Propósito |
|---------|-----------|
| `README.md` | Documentação completa |
| `QUICKSTART.md` | Iniciar em 5 minutos |
| `SETUP_MINIO.md` | Configurar MinIO |
| `DEPLOY_GUIDE.md` | Deploy em produção |
| `BEST_PRACTICES.md` | Melhores práticas |
| `DATABASE_SETUP.md` | Banco de dados |

### Ambiente
| Arquivo | Propósito |
|---------|-----------|
| `.env.example` | Template de variáveis públicas |
| `.env.local.example` | Template para desenvolvimento |
| `.env.local` | Variáveis locais (não commitar) |
| `.gitignore` | Arquivos ignorados no Git |

### Aplicação Principal
| Arquivo | Propósito |
|---------|-----------|
| `app/layout.tsx` | Layout root com Provider |
| `app/page.tsx` | Página principal com lógica de upload |
| `app/globals.css` | Estilos globais e design tokens |
| `app/api/upload/route.ts` | API de upload para MinIO |

### Componentes
| Arquivo | Propósito |
|---------|-----------|
| `components/header.tsx` | Header com logo e menu |
| `components/file-dropzone.tsx` | Zona de drag & drop com lista |
| `components/upload-history.tsx` | Histórico de arquivos enviados |

### Bibliotecas
| Arquivo | Propósito |
|---------|-----------|
| `lib/utils.ts` | Funções utilitárias (format, etc) |
| `lib/minio-client.ts` | Cliente MinIO para uso em APIs |

### Testes
| Arquivo | Propósito |
|---------|-----------|
| `__tests__/upload.test.ts` | Testes unitários e integração |

---

## 🔄 Fluxo de Dados

```
User Interface (page.tsx)
        ↓
   FileDropzone Component
        ↓
   /api/upload (Route Handler)
        ↓
   MinIO Client (lib/minio-client.ts)
        ↓
   MinIO Server (Storage)
        ↓
   Response com URL
        ↓
   UploadHistory Component
```

---

## 🎯 Componentes e Responsabilidades

### `page.tsx` (Página Principal)
- Gerencia estado de uploads (`uploadedFiles`, `isUploading`)
- Função `uploadToMinio` que orquestra o upload
- Renderiza Header, FileDropzone, Features, FAQs
- Passa estado para UploadHistory

### `file-dropzone.tsx` (Componente de Upload)
- Interface drag & drop
- Validação de arquivo (tipo, tamanho)
- Lista visual de arquivos selecionados
- Botão para enviar

### `upload-history.tsx` (Histórico)
- Lista arquivos já enviados
- Mostra nome, tamanho, data
- Botões de download e delete
- Empty state quando vazio

### `app/api/upload/route.ts` (API)
- Recebe arquivo via FormData
- Valida no servidor
- Faz upload para MinIO
- Retorna resposta com metadados

### `lib/minio-client.ts` (Cliente)
- Configuração do cliente MinIO
- Função `uploadFileToMinio` reutilizável
- Cria bucket automaticamente se necessário

### `header.tsx` (Header)
- Logo com ícone de prédio
- Título "Portal do Condomínio"
- Links de navegação
- Responsivo para mobile

---

## 📊 Dependências Principais

```json
{
  "next": "16.2.0",
  "react": "19.2.4",
  "typescript": "5.7.3",
  "tailwindcss": "4.2.0",
  "@aws-sdk/client-s3": "^3.1025.0",
  "lucide-react": "^0.564.0",
  "@radix-ui/...": "vários"
}
```

---

## 🎨 Design Tokens (globals.css)

```css
--primary: Azul Marinho (0.25 0.05 265)
--accent: Laranja Quente (0.7 0.15 30)
--background: Cinza Claro (0.97 0.01 85)
--foreground: Azul Escuro (0.25 0.05 265)
```

---

## 📱 Pastas por Responsabilidade

```
app/              → Roteamento e layouts
components/       → Componentes React
lib/              → Funções utilitárias e clientes
__tests__/        → Testes automatizados
public/           → Assets estáticos
scripts/          → Scripts de automação (se necessário)
```

---

## 🔐 Arquivos Sensíveis

⚠️ **NUNCA commitar:**
- `.env.local` (variáveis secretas)
- `.env.*.local` (desenvolvimento local)

✅ **SEGURO commitar:**
- `.env.example` (template público)
- Toda outra documentação

---

## 📈 Como Adicionar Funcionalidade

### Adicionar Nova Página
1. Criar `app/nova-pagina/page.tsx`
2. Next.js cria rota automaticamente

### Adicionar Novo Endpoint API
1. Criar `app/api/novo-endpoint/route.ts`
2. Exportar funções `GET`, `POST`, etc

### Adicionar Novo Componente
1. Criar `components/novo-componente.tsx`
2. Importar em `page.tsx` ou outro componente

### Adicionar Nova Biblioteca Utilitária
1. Criar `lib/nova-lib.ts`
2. Exportar funções
3. Importar onde necessário

---

## 🚀 Build e Deploy

```bash
# Desenvolvimento
npm run dev          # Inicia servidor em http://localhost:3000

# Build de produção
npm run build        # Compila código otimizado

# Executar build
npm start           # Inicia servidor em produção

# Linting
npm run lint        # Verifica erros de código
```

---

## 📝 Convenções de Código

- **Arquivos de Componentes**: `PascalCase` (Header.tsx, FileDropzone.tsx)
- **Arquivos de Utilitários**: `kebab-case` (file-utils.ts, minio-client.ts)
- **Pastas**: `lowercase` (components/, lib/, app/)
- **Constantes**: `UPPER_SNAKE_CASE` (MAX_FILE_SIZE, BUCKET_NAME)
- **Variáveis**: `camelCase` (uploadedFiles, isUploading)
- **Interfaces**: `PascalCase` com I prefix (IUploadFile, IResponse)

---

## ✅ Checklist de Novo Dev

- [ ] Leia README.md
- [ ] Execute QUICKSTART.md (5 min)
- [ ] Inicie MinIO
- [ ] Configure .env.local
- [ ] Rode `npm install`
- [ ] Rode `npm run dev`
- [ ] Teste upload em http://localhost:3000
- [ ] Explore código em components/
- [ ] Leia BEST_PRACTICES.md para extensões

---

**Estrutura criada com v0 - Sistema de arquivos organizado e escalável**
