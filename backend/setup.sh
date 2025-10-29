#!/bin/bash
# Executar migrações automaticamente
echo "Executando migrações do banco de dados..."
python manage.py migrate --noinput

# Criar superusuário apenas se não existir
echo "Verificando e criando superusuário 'admin' se não existir..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print('Superusuário admin criado com sucesso!')
else:
    print('Superusuário admin já existe.')
"
echo "Script de setup concluído."