# Twitter Clone

## Autor
Caio Dias de Oliveira

## Versão
1.0

## Data
30/10/2025

---

### Descrição do Projeto

O **Twitter** é uma aplicação full‑stack desenvolvida para aprofundar conhecimentos em Django e React. O projeto é organizado em monorepo com duas pastas principais:

- `backend/` (Django + DRF): API para autenticação JWT, usuários, perfis, tweets, seguidores e feed.
- `frontend/` (React + TypeScript): interface web consumindo a API com `axios` e estilizada com Tailwind CSS.

Implantações:
- **Backend**: Render (atual), com mídia servida pela Cloudinary (CDN).
- **Frontend**: Vercel.

Durante o desenvolvimento local, foi utilizada base Postgres (via Docker opcional) e ferramentas de qualidade/cobertura no CI.

---

### Funcionalidades

- **Autenticação JWT** (login, refresh).
- **Usuários e Perfis** (atualização de nome, bio e avatar com upload para Cloudinary).
- **Tweets** (criar, listar feed, curtir, retweetar, comentar, compartilhar).
- **Seguidores** (seguir/deixar de seguir, sugestões).
- **Feed** (personalizado por quem você segue).
- **Painel Administrativo** (Django Admin).
- **CORS** configurado para integração segura com o frontend.

---


### Stack, Ferramentas e Skills

- **Backend**
  - Django 5, Django REST Framework
  - Autenticação: djangorestframework-simplejwt
  - Armazenamento de mídia: Cloudinary + django-cloudinary-storage
  - CORS: django-cors-headers
  - Static files: WhiteNoise
  - Banco: PostgreSQL (dev), Render Postgres (prod), dj-database-url
  - Qualidade/CI: flake8, black, isort, pytest, pytest-django, pytest-cov, coverage
  - Utilitários: django-extensions, Pillow
  - Servidor: gunicorn

- **Frontend**
  - React 18 + TypeScript
  - Tailwind CSS
  - Axios (interceptores para JWT + refresh)
  - React Router
  - Jest/Testing Library (suporte no CI)
  - ESLint + Prettier

- **Infra/Deploy**
  - Render (backend)
  - Vercel (frontend)
  - Cloudinary (media CDN)
  - GitHub Actions (build, lint, testes, cobertura)

---

## Como rodar o projeto (Desenvolvedores)

### Pré‑requisitos

- Python 3.12+
- Node 18+
- Poetry 2.x
- Docker (opcional, para Postgres local)

---

## Backend (Django)

1. Clonar e entrar no backend:
   ```bash
   git clone https://github.com/caiodiasol/twitter.git
   cd twitter/backend
   ```

2. (Opcional) Subir Postgres com Docker:
   ```bash
   docker run --name twitter-postgres -e POSTGRES_PASSWORD=twitter_password \
     -e POSTGRES_USER=twitter_user -e POSTGRES_DB=twitter_db \
     -p 5432:5432 -d postgres:16
   ```

3. Variáveis de ambiente (desenvolvimento):
   - Em `backend/twitter/settings.py` já existem defaults.
   - Para usar Postgres local:
     - `POSTGRES_DB=twitter_db`
     - `POSTGRES_USER=twitter_user`
     - `POSTGRES_PASSWORD=twitter_password`
     - `DB_HOST=localhost`
     - `DB_PORT=5432`

4. Instalar dependências:
   ```bash
   poetry install
   ```

5. Migrações:
   ```bash
   poetry run python manage.py makemigrations
   poetry run python manage.py migrate
   ```

6. Criar superusuário:
   ```bash
   poetry run python manage.py createsuperuser
   ```

7. Rodar servidor:
   ```bash
   poetry run python manage.py runserver 0.0.0.0:8001
   ```
   API local: `http://localhost:8001/api/`

8. Storage de mídia (produção Render):
   - `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`
   - Em Django 5 usamos:
     ```python
     STORAGES = {
       "default": {"BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage"},
       "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
     }
     ```

9. Testes:
   ```bash
   poetry run pytest
   # ou
   poetry run python manage.py test
   ```

10. Linters/formatadores:
    ```bash
    poetry run flake8 .
    poetry run black --check .
    poetry run isort --check-only .
    ```

---

## Frontend (React + TS)

1. Entrar no diretório:
   ```bash
   cd ../frontend
   ```

2. Instalar dependências:
   ```bash
   npm install
   ```

3. Configurar API base (`src/services/api.tsx` já está automatizado):
   - Em dev: `http://localhost:8001/api`
   - Em prod: `https://twitter-backend-2hy7.onrender.com/api`

4. Rodar em desenvolvimento:
   ```bash
   npm start
   ```
   App local: `http://localhost:3000`

5. Testes (frontend):
   ```bash
   npm run test
   ```

---

## Deploy

### Backend (Render)
- Variáveis:
  - `RENDER=True` (já deduzido por env)
  - `SECRET_KEY=<segredo>`
  - `DATABASE_URL=<url do Postgres do Render>`
  - `CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>`
- Build/Start (via `render.yaml` ou painel):
  - `pip install -r backend/requirements.txt`
  - `python manage.py collectstatic --noinput`
  - `python manage.py migrate --noinput`
  - `gunicorn twitter.wsgi:application`

### Frontend (Vercel)
- Root: `frontend/`
- Build: `npm run build`
- Output Dir: `build`
- Domínio: `https://twitter-sage-two.vercel.app`

---

## Endpoints principais (exemplos)

- Auth:
  - `POST /api/token/` → obter `access` e `refresh`
  - `POST /api/token/refresh/` → novo `access`
- Usuários:
  - `GET /api/users/`
  - `GET /api/users/me/`
  - `PUT /api/users/update_profile/` (FormData: avatar, first_name, last_name, bio, email)
- Tweets:
  - `GET /api/tweets/feed/`
  - `POST /api/tweets/` (FormData: content, image?, location?)
  - `POST /api/tweets/{id}/like/`, `.../retweet/`, `.../comment/`

---

## Boas práticas adotadas

- Tipagem no frontend (TS) e interceptores de Axios para JWT + refresh.
- DRF com paginação, permissões e autenticação JWT.
- CORS estrito em produção.
- Linters/formatadores (black/isort/flake8, eslint/prettier).
- GitHub Actions com checagens de qualidade e testes.
- Upload de mídia via Cloudinary (URLs públicas e cache/CDN).
- WhiteNoise para estáticos no backend.

---

## Como contribuir

1. Crie um fork e uma branch:
   ```bash
   git checkout -b feat/minha-feature
   ```
2. Faça commits claros em inglês (convenções: feat, fix, chore, refactor, style, test, docs).
3. Abra um PR descrevendo o problema/solução e como validar.

---

Projeto desenvolvido como parte do aprendizado em desenvolvimento Full Stack, explorando boas práticas de backend, frontend, CI e deploy.
