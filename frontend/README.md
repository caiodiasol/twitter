# Twitter Frontend

## 🚀 Deploy na Vercel

### 1. Configuração
- Conecte o repositório GitHub na Vercel
- Configure:
  - **Root Directory:** `frontend`
  - **Build Command:** `npm run build`
  - **Output Directory:** `build`
  - **Environment Variables:**
    - `REACT_APP_API_BASE_URL`: `https://twitter-backend.onrender.com/api`

### 2. Deploy
- A Vercel fará o build e deploy automaticamente
- Anote a URL gerada (ex: `https://twitter-frontend.vercel.app`)

### 3. Atualizar CORS no Backend
- Volte ao Render e atualize o `CORS_ALLOWED_ORIGINS` no `settings.py` com a URL da Vercel

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test

# Executar linting
npm run lint
```

## 📁 Estrutura do Projeto

```
frontend/
├── public/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços de API
│   ├── contexts/      # Contextos React
│   └── utils/         # Utilitários
├── package.json
├── vercel.json        # Configuração da Vercel
└── README.md
```