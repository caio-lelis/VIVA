# 📁 Portal de Upload de Documentos - Condomínio

Uma plataforma moderna e segura para moradores de condomínios enviarem documentos e arquivos diretamente para armazenamento em nuvem (MinIO).

## ✨ Características

- **Upload Drag & Drop**: Interface intuitiva com arrastar e soltar
- **Integração MinIO**: Armazenamento seguro em objeto compatível com S3
- **Histórico de Uploads**: Lista de todos os arquivos enviados
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile
- **Validação em Tempo Real**: Verificação de tipo e tamanho de arquivo
- **Feedback Visual**: Status de upload em tempo real

## 🚀 Início Rápido

### Rodar tudo via Docker (Frontend + MinIO + Postgres + Redis)

```bash
docker compose up -d --build
```

Acesse:
- **Frontend**: http://localhost:3000
- **Backend (FastAPI)**: http://localhost:8000/api/health
- **MinIO API**: http://localhost:9000
- **MinIO Console**: http://localhost:9001

Login inicial no portal:
- **Usuário**: `morador`
- **Senha**: `viva2026`

Para parar:

```bash
docker compose down
```

### 1. Configurar MinIO

#### Opção A: Local (Desenvolvimento)

```bash
# macOS com Homebrew
brew install minio/stable/minio

# Criar diretório de dados
mkdir -p ~/minio-data

# Iniciar MinIO
minio server ~/minio-data --console-address :9001
```

#### Opção B: Docker

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

MinIO estará disponível em:
- **API**: http://localhost:9000
- **Console**: http://localhost:9001

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.local.example .env.local

# Editar com suas credenciais
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=condominio-docs
NEXT_PUBLIC_MINIO_ENDPOINT=http://localhost:9000
NEXT_PUBLIC_MINIO_BUCKET_NAME=condominio-docs
```

### 3. Instalar Dependências

```bash
npm install
# ou
pnpm install
```

### 4. Executar em Desenvolvimento

```bash
npm run dev
# ou
pnpm dev
```

Acesse http://localhost:3000

## 📊 Estrutura do Projeto

```
├── app/
│   ├── layout.tsx              # Layout da aplicação
│   ├── page.tsx                # Página principal
│   ├── globals.css             # Estilos globais
│   └── api/
│       └── upload/
│           └── route.ts         # API de upload
├── components/
│   ├── header.tsx              # Header com branding
│   ├── file-dropzone.tsx       # Componente de upload
│   └── upload-history.tsx      # Histórico de uploads
├── lib/
│   ├── utils.ts                # Utilitários
│   └── minio-client.ts         # Cliente MinIO
├── .env.example                # Variáveis de exemplo
├── SETUP_MINIO.md             # Guia de configuração MinIO
└── DEPLOY_GUIDE.md            # Guia de deploy
```

## 🎨 Design

A plataforma possui um design profissional e moderno, especialmente desenvolvido para sites de condomínios:

- **Cores**: Azul marinho e laranja (transmitindo confiança e modernidade)
- **Typography**: Fonte clara e legível em português
- **Layout**: Grid responsivo que se adapta a qualquer tela
- **Acessibilidade**: Seguindo as melhores práticas WCAG

## 📝 API de Upload

### Endpoint: `POST /api/upload`

**Request:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "success": true,
  "message": "Arquivo enviado com sucesso",
  "data": {
    "key": "uploads/1702500000000-document.pdf",
    "originalName": "document.pdf",
    "size": 102400,
    "type": "application/pdf"
  }
}
```

## 🔧 Configuração Avançada

### Limite de Tamanho de Arquivo

Edite `components/file-dropzone.tsx`:
```typescript
maxSizeMB = 50  // Alterar para 50MB
```

### Tipos de Arquivo Permitidos

Edite `components/file-dropzone.tsx`:
```typescript
acceptedTypes = [
  ".pdf", ".doc", ".docx", 
  ".xls", ".xlsx", 
  ".jpg", ".jpeg", ".png",
  ".zip"  // Adicionar novo tipo
]
```

### CORS no MinIO

Se precisar de CORS, edite as configurações no MinIO:
```bash
mc cors set minio/condominio-docs '{"AllowedOrigins":["https://seudominio.com"]}'
```

## 🚀 Deploy

### Deploy na Vercel (Recomendado)

1. Push para GitHub
2. Connect no Vercel
3. Adicione variáveis de ambiente
4. Deploy automático

Veja [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) para mais detalhes.

### Deploy em Servidor Próprio

```bash
npm run build
npm start

# Com PM2
pm2 start "npm start" --name "condominio-upload"
```

## 📱 Funcionalidades Futuras

- [ ] Autenticação de usuários
- [ ] Gestão de permissões por unidade
- [ ] Visualização de arquivos
- [ ] Download com rastreamento
- [ ] Notificações por email
- [ ] Integração com WhatsApp
- [ ] Dashboard administrativo

## 🛡️ Segurança

✅ Validação de arquivos no servidor
✅ Nomes de arquivo únicos com timestamp
✅ Suporte HTTPS em produção
✅ Acesso controlado via MinIO
✅ Sem exposição de credenciais

## 🐛 Troubleshooting

### "Connection refused"
- Verifique se MinIO está rodando
- Confirme `MINIO_ENDPOINT`

### "Invalid credentials"
- Verifique `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY`
- Confirme no console MinIO

### "File too large"
- Aumente `maxSizeMB` em `file-dropzone.tsx`
- Ou configure limite no servidor/proxy

## 📚 Referências

- [Next.js Documentation](https://nextjs.org/docs)
- [MinIO Documentation](https://docs.min.io/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/AWSJavaScriptSDK/)

## 📄 Licença

MIT License - Sinta-se livre para usar em seus projetos!

## 💬 Suporte

Para dúvidas ou problemas:
1. Verifique [SETUP_MINIO.md](./SETUP_MINIO.md)
2. Verifique [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md)
3. Abra uma issue no GitHub

---

**Desenvolvido com ❤️ para condomínios modernos**
