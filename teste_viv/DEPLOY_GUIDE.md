# Guia de Deploy - Portal de Upload de Documentos

## Deploy na Vercel

### 1. Preparação

```bash
# Clone ou upload seu projeto para GitHub
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Conectar ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Selecione seu repositório GitHub
4. Configure as variáveis de ambiente

### 3. Variáveis de Ambiente

No painel de controle do Vercel, adicione:

```
MINIO_ENDPOINT=seu_minio_endpoint
MINIO_ACCESS_KEY=sua_access_key
MINIO_SECRET_KEY=sua_secret_key
MINIO_BUCKET_NAME=condominio-docs
NEXT_PUBLIC_MINIO_ENDPOINT=seu_minio_endpoint_publico
NEXT_PUBLIC_MINIO_BUCKET_NAME=condominio-docs
```

### 4. Deploy

Clique em "Deploy" e aguarde a conclusão.

---

## Deploy em Servidor Próprio

### Requisitos

- Node.js 18+
- MinIO server configurado
- PM2 (para gerenciamento de processos)

### Instalação

```bash
# Clone o repositório
git clone seu_repo
cd seu_projeto

# Instale dependências
npm install

# Build da aplicação
npm run build

# Instale PM2 globalmente
npm install -g pm2

# Inicie a aplicação
pm2 start "npm run start" --name "condominio-upload"

# Salve a configuração PM2
pm2 save
```

### Nginx (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name seu_dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL com Certbot

```bash
# Instale Certbot
sudo apt-get install certbot python3-certbot-nginx

# Gere certificado
sudo certbot certonly --nginx -d seu_dominio.com

# Configure renovação automática
sudo certbot renew --dry-run
```

---

## Backup de Dados MinIO

### Backup Manual

```bash
# Use mc (MinIO Client) para fazer backup
mc alias set minio http://localhost:9000 minioadmin minioadmin

# Backup do bucket
mc mirror minio/condominio-docs ./backup/condominio-docs

# Restaurar
mc mirror ./backup/condominio-docs minio/condominio-docs
```

### Backup Automático

```bash
# Crie um script backup.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/condominio/$TIMESTAMP"

mkdir -p $BACKUP_DIR
mc mirror minio/condominio-docs $BACKUP_DIR

# Adicione ao crontab (executar diariamente)
crontab -e
# Adicione: 0 2 * * * /path/to/backup.sh
```

---

## Monitoramento

### Logs

```bash
# Ver logs em tempo real
pm2 logs "condominio-upload"

# Ver status
pm2 status

# Reiniciar aplicação
pm2 restart "condominio-upload"

# Parar aplicação
pm2 stop "condominio-upload"
```

### Performance

- Monitore o uso de armazenamento MinIO regularmente
- Configure limite de tamanho de arquivo adequado
- Implemente limpeza de arquivos antigos se necessário

---

## Troubleshooting Deploy

**Erro: "Cannot find module 'minio'"**
```bash
npm install minio
```

**Erro: "Connection refused MinIO"**
- Verifique se MinIO está rodando
- Confirme endpoint e credenciais

**Erro: "Bucket does not exist"**
- A aplicação cria automaticamente, mas você pode criar manualmente:
```bash
mc mb minio/condominio-docs
```

**Aplicação lenta**
- Verifique se MinIO tem recursos suficientes
- Aumente timeout se necessário
- Considere usar CDN para downloads frequentes

---

## Segurança

✅ Use HTTPS em produção
✅ Configure CORS adequadamente no MinIO
✅ Use senhas fortes para MinIO
✅ Backup regular de dados
✅ Monitore acessos e uploads
✅ Implemente rate limiting se necessário

---

## Suporte

Para mais informações:
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [MinIO Documentation](https://docs.min.io/)
- [Vercel Documentation](https://vercel.com/docs)
