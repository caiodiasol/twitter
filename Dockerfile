# Dockerfile

# Use uma imagem base oficial do Python
FROM python:3.13-slim

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Instalar dependências do sistema necessárias para PostgreSQL
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copia o arquivo de dependências do Poetry
COPY pyproject.toml poetry.lock /app/

# Instala o Poetry
RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root

# Copia todo o código do projeto para o contêiner
COPY . /app/

# Criar usuário não-root para segurança
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expõe a porta do Django
EXPOSE 8000

# Comando para iniciar o servidor Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]