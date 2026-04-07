# Melhores Práticas - Portal de Upload

## 📋 Índice

1. [Segurança](#-segurança)
2. [Performance](#-performance)
3. [Escalabilidade](#-escalabilidade)
4. [Manutenção](#-manutenção)
5. [Extensões](#-extensões)

---

## 🔒 Segurança

### 1. Autenticação de Usuários

Implemente autenticação para rastrear quem enviou cada arquivo:

```typescript
// app/api/upload/route.ts
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Verificar autenticação
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ... resto do código
}
```

### 2. Validação de Arquivo

Sempre valide no servidor:

```typescript
// Verificar assinatura do arquivo (magic bytes)
const buffer = Buffer.from(await file.arrayBuffer())
const magicBytes = buffer.slice(0, 4)

// PDF: 25 50 44 46
// JPEG: FF D8 FF E0
// PNG: 89 50 4E 47
```

### 3. Rate Limiting

Evite abuso:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads por hora
})

// Em route.ts
const { success } = await ratelimit.limit(userId)
if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
```

### 4. Variáveis de Ambiente

**NUNCA** exponha chaves secretas:

```bash
# .env.local (NÃO commitar)
MINIO_SECRET_KEY=sua_chave_super_secreta

# .env.example (pode ser público)
MINIO_SECRET_KEY=seu_valor_aqui

# .gitignore
.env.local
.env.*.local
```

### 5. CORS e CSRF

Configure CORS corretamente no MinIO:

```bash
# Apenas seu domínio
mc cors set minio/condominio-docs \
  '{
    "AllowedOrigins": ["https://seudominio.com"],
    "AllowedMethods": ["GET", "POST"],
    "AllowedHeaders": ["Authorization"]
  }'
```

---

## ⚡ Performance

### 1. Compressão de Arquivo

Comprima PDFs antes de armazenar:

```typescript
import sharp from 'sharp'

// Para imagens
const compressed = await sharp(buffer)
  .resize(2000, 2000, { withoutEnlargement: true })
  .webp({ quality: 80 })
  .toBuffer()
```

### 2. Chunked Upload

Para arquivos grandes, implemente upload em chunks:

```typescript
// Útil para arquivos > 100MB
// Existem bibliotecas: tus.io, resumable.js
```

### 3. Caching

Cache de listagem de arquivos:

```typescript
// Reutilizar dados por 5 minutos
const cachedFiles = await redis.get(`files:${userId}`)
if (cachedFiles) return JSON.parse(cachedFiles)
```

### 4. CDN para Downloads

Use Cloudflare ou AWS CloudFront para servir downloads:

```typescript
// Gerar URL pré-assinada
const presignedUrl = await minioClient.presignedGetObject(
  bucketName,
  objectName,
  24 * 60 * 60 // 24 horas
)
```

---

## 📈 Escalabilidade

### 1. Organização de Buckets

```bash
# Estrutura recomendada
condominio-docs/
├── apartamentos/101/docs/
├── apartamentos/102/docs/
├── atas-assembleia/
├── manutencao/
└── backup/
```

### 2. Replicação MinIO

Configure replicação para backup automático:

```bash
# MinIO replication
mc replicate add minio1 minio2 --replicate=delete
```

### 3. Load Balancing

Para múltiplas instâncias do app:

```nginx
upstream app {
  server localhost:3000;
  server localhost:3001;
  server localhost:3002;
}

server {
  location / {
    proxy_pass http://app;
  }
}
```

### 4. Database Tracking

Rastreie uploads em banco de dados:

```prisma
// schema.prisma
model Upload {
  id        String   @id @default(cuid())
  userId    String
  filename  String
  minionKey String
  size      Int
  type      String
  uploadedAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 🔧 Manutenção

### 1. Monitoramento

```typescript
// lib/monitoring.ts
import { recordMetric } from '@/lib/sentry'

export async function trackUpload(filename: string, size: number) {
  recordMetric('upload', {
    filename,
    size,
    timestamp: new Date(),
  })
}
```

### 2. Logs

```typescript
// Estruture seus logs
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  event: 'file_uploaded',
  userId: session.user.id,
  filename: file.name,
  size: file.size,
  status: 'success',
}))
```

### 3. Cleanup de Arquivos

Limpe arquivos antigos automaticamente:

```typescript
// scripts/cleanup.ts
async function deleteOldFiles(olderThanDays: number) {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000)
  
  // Buscar arquivos antigos do banco
  const oldFiles = await db.upload.findMany({
    where: { uploadedAt: { lt: cutoffDate } }
  })

  // Deletar do MinIO
  for (const file of oldFiles) {
    await minioClient.removeObject(BUCKET, file.minioKey)
    await db.upload.delete({ where: { id: file.id } })
  }
}
```

### 4. Backup Regular

```bash
#!/bin/bash
# backup.sh
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mc mirror minio/condominio-docs /backups/$TIMESTAMP

# Crontab
0 2 * * * /path/to/backup.sh
```

---

## 🚀 Extensões Recomendadas

### 1. Autenticação (Recomendado)

```typescript
// Use NextAuth.js ou Auth0
import { auth } from '@/lib/auth'

// Em qualquer API route
const session = await auth()
if (!session) return null
```

### 2. Notificações

```typescript
// Enviar email ao upload
import { sendEmail } from '@/lib/email'

await sendEmail({
  to: user.email,
  subject: 'Arquivo enviado com sucesso',
  template: 'upload-receipt',
})
```

### 3. Virusscan

```typescript
// Integrar ClamAV ou VirusTotal
import { scanFile } from '@/lib/virusscan'

const isSafe = await scanFile(buffer)
if (!isSafe) throw new Error('Arquivo contém vírus!')
```

### 4. OCR para Documentos

```typescript
// Extrair texto de documentos
import Tesseract from 'tesseract.js'

const { data: { text } } = await Tesseract.recognize(
  buffer,
  'por'
)
```

### 5. Versionamento

```typescript
// Manter histórico de versões
condominio-docs/
├── documento_v1_2024-01.pdf
├── documento_v2_2024-02.pdf
└── documento_v3_2024-03.pdf (atual)
```

---

## ✅ Checklist de Produção

Antes de deploy:

- [ ] Variáveis de ambiente configuradas
- [ ] HTTPS habilitado
- [ ] Rate limiting implementado
- [ ] Autenticação em place
- [ ] Backup automático configurado
- [ ] Logs centralizados (Sentry, DataDog)
- [ ] Monitoring ativo
- [ ] CORS configurado corretamente
- [ ] Certificados SSL válidos
- [ ] Plano de disaster recovery

---

## 📚 Recursos

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/deploying#security-checklist)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MinIO Security](https://docs.min.io/minio/baremetal/security/minio-security.html)
