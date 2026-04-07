# Integração com Banco de Dados

Este guia mostra como adicionar rastreamento de uploads em banco de dados.

## Opção 1: Supabase (Recomendado)

### 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Copie as credenciais

### 2. Criar Tabelas

```sql
-- Tabela de usuários
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  created_at timestamp default now()
);

-- Tabela de uploads
create table uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  filename text not null,
  minio_key text not null,
  size_bytes integer,
  mime_type text,
  created_at timestamp default now()
);

-- Índices para performance
create index uploads_user_id_idx on uploads(user_id);
create index uploads_created_at_idx on uploads(created_at);
```

### 3. Instalar Supabase Client

```bash
npm install @supabase/supabase-js
```

### 4. Criar Wrapper

```typescript
// lib/database.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function recordUpload(
  userId: string,
  filename: string,
  minioKey: string,
  size: number,
  mimeType: string
) {
  const { data, error } = await supabase
    .from('uploads')
    .insert({
      user_id: userId,
      filename,
      minio_key: minioKey,
      size_bytes: size,
      mime_type: mimeType,
    })
    .select()

  if (error) throw error
  return data
}

export async function getUserUploads(userId: string) {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}
```

### 5. Usar em API

```typescript
// app/api/upload/route.ts
import { recordUpload } from '@/lib/database'

export async function POST(request: NextRequest) {
  // ... código de upload para MinIO
  
  // Registrar no banco
  await recordUpload(
    session.user.id,
    file.name,
    minioKey,
    file.size,
    file.type
  )
  
  return NextResponse.json({ success: true })
}
```

---

## Opção 2: Prisma + PostgreSQL

### 1. Instalar Prisma

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

### 2. Configurar .env

```
DATABASE_URL="postgresql://user:password@localhost:5432/condominio"
```

### 3. Schema Prisma

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  uploads   Upload[]
  createdAt DateTime @default(now())
}

model Upload {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  filename  String
  minioKey  String
  size      Int
  mimeType  String
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([createdAt])
}
```

### 4. Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Usar em API

```typescript
// lib/database.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function recordUpload(
  userId: string,
  filename: string,
  minioKey: string,
  size: number,
  mimeType: string
) {
  return await prisma.upload.create({
    data: {
      userId,
      filename,
      minioKey,
      size,
      mimeType,
    },
  })
}

export async function getUserUploads(userId: string) {
  return await prisma.upload.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}
```

---

## Opção 3: MongoDB

### 1. Instalar MongoDB

```bash
npm install mongodb mongoose
```

### 2. Schema Mongoose

```typescript
// lib/mongodb.ts
import mongoose from 'mongoose'

const uploadSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  filename: { type: String, required: true },
  minioKey: { type: String, required: true },
  size: { type: Number, required: true },
  mimeType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
})

export const Upload = mongoose.model('Upload', uploadSchema)
```

### 3. Usar em API

```typescript
import { Upload } from '@/lib/mongodb'

export async function recordUpload(...) {
  return await Upload.create({
    userId,
    filename,
    minioKey,
    size,
    mimeType,
  })
}
```

---

## Estatísticas do Condomínio

Com banco de dados, você pode gerar relatórios:

```typescript
// Exemplo: Arquivos por mês
export async function getUploadStats(startDate: Date, endDate: Date) {
  const stats = await supabase
    .from('uploads')
    .select('created_at, size_bytes')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  const totalSize = stats.reduce((sum, item) => sum + item.size_bytes, 0)
  const totalFiles = stats.length

  return {
    totalFiles,
    totalSizeGB: (totalSize / 1024 / 1024 / 1024).toFixed(2),
    avgFileSize: (totalSize / totalFiles / 1024 / 1024).toFixed(2),
  }
}
```

---

## Backup da Tabela

```bash
# PostgreSQL
pg_dump -U user -d condominio > backup.sql

# Restaurar
psql -U user -d condominio < backup.sql

# MongoDB
mongodump --db condominio
mongorestore --db condominio ./dump/condominio
```

---

## Checklist

- [ ] Banco de dados escolhido
- [ ] Tabelas criadas
- [ ] Cliente configurado
- [ ] API de upload atualizada
- [ ] Função `recordUpload` implementada
- [ ] Função `getUserUploads` implementada
- [ ] Testes de banco de dados
- [ ] Backup automático configurado
- [ ] Índices de performance criados
