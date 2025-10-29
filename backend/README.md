# Twitter Backend

## 🚀 Deploy no Render

### 1. Configuração do Banco de Dados
- Crie um PostgreSQL no Render
- Anote a `DATABASE_URL` gerada

### 2. Deploy do Backend
- Conecte o repositório GitHub no Render
- Configure:
  - **Root Directory:** `backend`
  - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
  - **Start Command:** `gunicorn twitter.wsgi:application`
  - **Environment Variables:**
    - `DATABASE_URL` (do PostgreSQL)
    - `SECRET_KEY` (gerar automaticamente)
    - `DEBUG=False`
    - `RENDER=True`

### 3. Executar Migrações
Após o deploy, execute no terminal do Render:
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 4. Configurar CORS
Após o deploy do frontend na Vercel, atualize o `CORS_ALLOWED_ORIGINS` no `settings.py` com a URL da Vercel.

## 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
poetry install

# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Executar servidor
python manage.py runserver
```