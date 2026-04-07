# Configuração - Portal de Upload de Documentos do Condomínio

## Requisitos

- Node.js 18+
- MinIO server rodando

## Configuração do MinIO

### Opção 1: MinIO Local (Desenvolvimento)

```bash
# Instalar MinIO (macOS com Homebrew)
brew install minio/stable/minio

# Criar diretório para dados
mkdir -p ~/minio-data

# Executar servidor MinIO
minio server ~/minio-data --console-address :9001
```

O servidor estará disponível em:
- **API**: http://localhost:9000
- **Console**: http://localhost:9001

Credenciais padrão:
- **Access Key**: minioadmin
- **Secret Key**: minioadmin

### Opção 2: Docker

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

## Variáveis de Ambiente

1. Copie `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

2. Configure as variáveis com suas credenciais do MinIO:
```
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=condominio-docs
```

## Instalação e Execução

```bash
# Instalar dependências
npm install
# ou
pnpm install

# Executar desenvolvimento
npm run dev
# ou
pnpm dev
```

Acesse http://localhost:3000

## Funcionalidades

✅ **Upload de Arquivos**
- Drag & drop de arquivos
- Clique para selecionar
- Validação de tipo e tamanho

✅ **Integração MinIO**
- Upload automático para MinIO
- Suporte a múltiplos tipos de arquivo
- Nomes de arquivo únicos com timestamp

✅ **Design Profissional**
- Interface moderna e intuitiva
- Responsive para mobile
- Feedback visual em tempo real

✅ **Segurança**
- Validação no servidor
- Controle de tipos MIME
- Limites de tamanho de arquivo

## Estrutura de Arquivos

```
app/
├── page.tsx                 # Página principal
├── layout.tsx              # Layout da aplicação
├── globals.css             # Estilos globais
└── api/
    └── upload/
        └── route.ts         # API de upload
components/
├── header.tsx              # Header com logo
└── file-dropzone.tsx       # Componente dropzone
lib/
└── minio-client.ts         # Cliente MinIO
```

## Troubleshooting

**Erro: "Connection refused"**
- Verifique se MinIO está rodando
- Confirme o MINIO_ENDPOINT nas variáveis

**Erro: "Invalid credentials"**
- Verifique MINIO_ACCESS_KEY e MINIO_SECRET_KEY
- Confira as credenciais no console do MinIO

**Erro: "Bucket not found"**
- O bucket será criado automaticamente no primeiro upload
- Ou crie manualmente via console MinIO

## Próximos Passos

1. Implemente autenticação para usuários do condomínio
2. Adicione gestão de permissões por unidade/morador
3. Implemente listagem e download de arquivos
4. Adicione busca e filtros
5. Configure backup automático dos arquivos
