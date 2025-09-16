# Instrucciones de despliegue para Voltereta

## Requisitos del servidor

- Node.js 16 o superior
- MySQL 5.7 o superior
- Nginx/Apache (como proxy reverso)
- PM2 (para gestión de procesos)
- SSL/TLS certificado

## Pasos de instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/luisrocedev/TPV-Voltereta.git
cd TPV-Voltereta
```

### 2. Instalar dependencias

```bash
npm install --production
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con los datos reales de producción
```

### 4. Configurar base de datos

```bash
mysql -u usuario -p nombre_db < voltereta_db.sql
```

### 5. Crear directorios necesarios

```bash
mkdir -p public/uploads public/profile_pics
chmod 777 public/uploads public/profile_pics
```

### 6. Instalar PM2 globalmente

```bash
npm install -g pm2
```

### 7. Configurar PM2

```bash
pm2 start server.js --name "voltereta-app"
pm2 save
pm2 startup
```

### 8. Configurar Nginx como proxy reverso

```nginx
server {
    listen 443 ssl;
    server_name voltereta.tudominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Configuración para archivos estáticos
    location /uploads/ {
        alias /var/www/voltereta/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /profile_pics/ {
        alias /var/www/voltereta/public/profile_pics/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración para Socket.io
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Configuración principal
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Comandos útiles

### Gestión con PM2

```bash
pm2 list                    # Ver procesos
pm2 restart voltereta-app   # Reiniciar app
pm2 logs voltereta-app      # Ver logs
pm2 stop voltereta-app      # Detener app
pm2 delete voltereta-app    # Eliminar app
```

### Actualizar código

```bash
git pull origin main
npm install --production
pm2 restart voltereta-app
```

### Backup

```bash
# Backup de base de datos
mysqldump -u usuario -p voltereta_prod > backup_voltereta_$(date +%Y%m%d_%H%M%S).sql

# Backup de archivos subidos
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz public/uploads public/profile_pics
```
