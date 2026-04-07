# ⚡ Quick Start - 5 Minutos

Guia rápido para começar em menos de 5 minutos!

## 1️⃣ Instalar MinIO (2 min)

### Docker (Mais Fácil)

```bash
docker run -p 9000:9000 -p 9001:9001 \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  minio/minio server /data --console-address ":9001"
```

✅ MinIO rodando em `http://localhost:9000`

### macOS (Homebrew)

```bash
brew install minio/stable/minio
mkdir -p ~/minio-data
minio server ~/minio-data --console-address :9001
```

---

## 2️⃣ Configurar Variáveis (1 min)

```bash
# Na raiz do projeto
cp .env.local.example .env.local
```

Pronto! Já vem com valores padrão para desenvolvimento local.

---

## 3️⃣ Instalar Dependências (1 min)

```bash
npm install
```

---

## 4️⃣ Executar (1 min)

```bash
npm run dev
```

Abra seu navegador em **http://localhost:3000** 🎉

---

## ✅ Pronto!

Você agora pode:
- ✨ Arrastar e soltar arquivos
- 📤 Fazer upload para MinIO
- 📋 Ver histórico de uploads
- 🎨 Explorar design profissional

---

## 🧪 Testar Upload

1. Clique no área de drag & drop
2. Selecione um arquivo PDF, DOC ou imagem
3. Clique no botão "Enviar"
4. Veja o arquivo aparecer no histórico

---

## 🔗 Acessar MinIO Console

- URL: http://localhost:9001
- Usuário: `minioadmin`
- Senha: `minioadmin`

Aqui você pode:
- Ver bucket `condominio-docs`
- Gerenciar arquivos manualmente
- Criar novos buckets

---

## 🚀 Próximos Passos

### Adicionar Autenticação
```bash
npm install next-auth
```

### Adicionar Banco de Dados
```bash
npm install @supabase/supabase-js
# ou
npm install prisma
```

### Deploy na Vercel
1. Push no GitHub
2. Conectar no Vercel
3. Adicionar variáveis de ambiente
4. Deploy! 🚀

---

## 📚 Documentação Completa

- [SETUP_MINIO.md](./SETUP_MINIO.md) - Configuração detalhada do MinIO
- [README.md](./README.md) - Documentação completa do projeto
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) - Guia de deploy em produção
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Melhores práticas e extensões
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Integração com banco de dados

---

## 🆘 Problemas?

### MinIO não conecta
```bash
# Verifique se está rodando
docker ps | grep minio
```

### Erro "Connection refused"
- Certifique-se que MinIO está rodando
- Verifique `.env.local`

### Build falha
```bash
# Limpe cache
rm -rf .next node_modules
npm install
npm run dev
```

---

## 💡 Dicas

- Arraste múltiplos arquivos por vez
- Arquivos máximo 10MB (configure em `file-dropzone.tsx`)
- Design totalmente responsivo para mobile
- Todos os uploads salvos no MinIO (persistente)

---

**Desenvolvido com ❤️ por v0**
