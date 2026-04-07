# CORS Configuration para MinIO

## O que é CORS?

CORS (Cross-Origin Resource Sharing) controla quais domínios podem acessar seus recursos MinIO.

## Configuração por Ambiente

### 🧪 Desenvolvimento Local

```bash
# Permitir localhost para desenvolvimento
mc alias set minio http://localhost:9000 minioadmin minioadmin

mc cors set minio/condominio-docs \
  '{
    "AllowedOrigins": ["http://localhost:3000", "http://localhost:3001"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposedHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }'
```

### 🚀 Produção

```bash
# Seu domínio apenas
mc alias set minio https://seu-minio.com minioadmin minioadmin

mc cors set minio/condominio-docs \
  '{
    "AllowedOrigins": ["https://seu-dominio.com"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["Authorization", "Content-Type"],
    "ExposedHeaders": ["ETag"],
    "MaxAgeSeconds": 86400
  }'
```

### 🌍 Multi-domínio (Se Necessário)

```bash
mc cors set minio/condominio-docs \
  '{
    "AllowedOrigins": [
      "https://seu-dominio.com",
      "https://app.seu-dominio.com",
      "https://admin.seu-dominio.com"
    ],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedHeaders": ["*"],
    "ExposedHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }'
```

## Explicação dos Campos

| Campo | Descrição |
|-------|-----------|
| `AllowedOrigins` | Domínios que podem acessar (com protocol) |
| `AllowedMethods` | Métodos HTTP permitidos |
| `AllowedHeaders` | Headers que podem ser enviados |
| `ExposedHeaders` | Headers que cliente pode ler |
| `MaxAgeSeconds` | Cache de preflight request (em segundos) |

## ✅ Melhores Práticas

### 1. Sempre Use HTTPS em Produção

```bash
# ❌ NUNCA (não seguro)
"AllowedOrigins": ["http://seu-dominio.com"]

# ✅ SIM (seguro)
"AllowedOrigins": ["https://seu-dominio.com"]
```

### 2. Seja Específico

```bash
# ❌ MUITO ABERTO (risco de segurança)
"AllowedOrigins": ["*"]

# ✅ ESPECÍFICO (recomendado)
"AllowedOrigins": ["https://seu-dominio.com"]
```

### 3. Limite Métodos HTTP

```bash
# ❌ TODOS OS MÉTODOS (risco)
"AllowedMethods": ["GET", "PUT", "POST", "DELETE", "PATCH", "HEAD"]

# ✅ NECESSÁRIOS APENAS (recomendado)
"AllowedMethods": ["GET", "POST"]
```

### 4. Controle Headers

```bash
# ❌ TODOS OS HEADERS (risco)
"AllowedHeaders": ["*"]

# ✅ ESPECÍFICOS (recomendado)
"AllowedHeaders": ["Authorization", "Content-Type"]
```

## Verificar Configuração Atual

```bash
# Ver CORS atual
mc cors get minio/condominio-docs

# Remover CORS (resetar)
mc cors remove minio/condominio-docs
```

## Teste de CORS

```bash
# Teste com curl
curl -i -X OPTIONS \
  -H "Origin: https://seu-dominio.com" \
  -H "Access-Control-Request-Method: POST" \
  https://seu-minio.com/condominio-docs

# Você deve ver headers como:
# Access-Control-Allow-Origin: https://seu-dominio.com
# Access-Control-Allow-Methods: GET, POST, PUT
```

## Solução de Problemas

### Erro: "No 'Access-Control-Allow-Origin' header"

**Causa:** Domínio não está na whitelist

**Solução:**
```bash
# Adicione seu domínio
mc cors set minio/condominio-docs \
  '{"AllowedOrigins": ["https://seu-dominio.com"], ...}'
```

### Erro: "Method not allowed"

**Causa:** Método HTTP não permitido

**Solução:**
```bash
# Adicione método necessário
"AllowedMethods": ["GET", "POST", "PUT"]
```

### Preflight Request Muito Lento

**Causa:** MaxAgeSeconds baixo demais

**Solução:**
```bash
# Aumente cache
"MaxAgeSeconds": 86400  # 24 horas em produção
```

## Configuração para Vercel

Se usar Vercel para frontend:

```bash
mc cors set minio/condominio-docs \
  '{
    "AllowedOrigins": [
      "https://seu-projeto.vercel.app",
      "https://seu-dominio-custom.com"
    ],
    "AllowedMethods": ["GET", "POST", "PUT"],
    "AllowedHeaders": ["Authorization", "Content-Type"],
    "ExposedHeaders": ["ETag"],
    "MaxAgeSeconds": 86400
  }'
```

## Proxy Reverso como Alternativa

Se quiser evitar CORS, use reverse proxy no seu servidor:

```nginx
# nginx.conf
location /minio/ {
    proxy_pass http://seu-minio:9000/;
    proxy_set_header Host $host;
}
```

Então o client acessa `/minio/arquivo` em vez de `https://seu-minio:9000/arquivo`

## Checklist de Segurança CORS

- [ ] HTTPS habilitado em produção
- [ ] Domínios específicos (não `*`)
- [ ] Métodos limitados (apenas necessários)
- [ ] Headers controlados
- [ ] MaxAgeSeconds apropriado
- [ ] Teste com curl antes de deploy
- [ ] Monitore erros 403/CORS em produção
- [ ] Revise CORS mensalmente

---

**Documentação CORS - Segurança em Primeiro Lugar**
