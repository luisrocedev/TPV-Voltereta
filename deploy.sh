#!/bin/bash

# Script de despliegue para Voltereta
# Uso: ./deploy.sh [produccion|desarrollo]

set -e

ENVIRONMENT=${1:-desarrollo}
PROJECT_DIR="/var/www/voltereta"
BACKUP_DIR="/var/backups/voltereta"
DATE=$(date +%Y%m%d_%H%M%S)
APP_NAME="voltereta-app"

echo "🚀 Iniciando despliegue de Voltereta en modo: $ENVIRONMENT"

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

# Función para hacer backup de la base de datos
backup_database() {
    echo "📦 Creando backup de base de datos..."
    if [ -f .env ]; then
        DB_NAME=$(grep DB_NAME .env | cut -d '=' -f2)
        DB_USER=$(grep DB_USER .env | cut -d '=' -f2)
        DB_PASS=$(grep DB_PASS .env | cut -d '=' -f2)
        
        mysqldump -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_DIR/db_backup_$DATE.sql"
        echo "✅ Backup guardado en: $BACKUP_DIR/db_backup_$DATE.sql"
    else
        echo "⚠️  No se encontró .env, saltando backup de BD"
    fi
}

# Función para hacer backup de archivos subidos
backup_uploads() {
    echo "📦 Creando backup de archivos subidos..."
    if [ -d "public/uploads" ] && [ -d "public/profile_pics" ]; then
        tar -czf "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" public/uploads public/profile_pics
        echo "✅ Backup de archivos guardado en: $BACKUP_DIR/uploads_backup_$DATE.tar.gz"
    else
        echo "⚠️  No se encontraron directorios de uploads"
    fi
}

# Función para actualizar código
update_code() {
    echo "🔄 Actualizando código..."
    git pull origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Código actualizado correctamente"
    else
        echo "❌ Error al actualizar código"
        exit 1
    fi
}

# Función para instalar dependencias
install_dependencies() {
    echo "📦 Instalando dependencias..."
    if [ "$ENVIRONMENT" = "produccion" ]; then
        npm install --production
    else
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Dependencias instaladas correctamente"
    else
        echo "❌ Error al instalar dependencias"
        exit 1
    fi
}

# Función para crear directorios necesarios
create_directories() {
    echo "📁 Creando directorios necesarios..."
    mkdir -p public/uploads public/profile_pics logs
    chmod 777 public/uploads public/profile_pics
    echo "✅ Directorios creados y permisos configurados"
}

# Función para gestionar PM2
manage_pm2() {
    echo "🔄 Gestionando proceso PM2..."
    
    # Verificar si PM2 está instalado
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Instalando PM2..."
        npm install -g pm2
    fi
    
    # Verificar si la aplicación ya está corriendo
    if pm2 list | grep -q "$APP_NAME"; then
        echo "🔄 Reiniciando aplicación..."
        pm2 restart "$APP_NAME"
    else
        echo "🚀 Iniciando aplicación..."
        pm2 start server.js --name "$APP_NAME"
        pm2 save
    fi
    
    echo "✅ Aplicación gestionada con PM2"
}

# Función para verificar salud de la aplicación
health_check() {
    echo "🏥 Verificando salud de la aplicación..."
    sleep 5
    
    if pm2 list | grep -q "$APP_NAME.*online"; then
        echo "✅ Aplicación corriendo correctamente"
        
        # Verificar que el servidor responda
        if curl -f http://localhost:3000 &> /dev/null; then
            echo "✅ Servidor respondiendo correctamente"
        else
            echo "⚠️  Servidor no responde en el puerto 3000"
        fi
    else
        echo "❌ Error: La aplicación no está corriendo"
        pm2 logs "$APP_NAME" --lines 20
        exit 1
    fi
}

# Ejecutar despliegue
cd "$PROJECT_DIR"

if [ "$ENVIRONMENT" = "produccion" ]; then
    backup_database
    backup_uploads
fi

update_code
install_dependencies
create_directories
manage_pm2
health_check

echo "🎉 Despliegue completado exitosamente en modo: $ENVIRONMENT"
echo "🕐 Fecha: $(date)"

# Mostrar estado
echo "📊 Estado del sistema:"
echo "- Espacio en disco: $(df -h . | tail -1 | awk '{print $4}') disponible"
echo "- Última actualización: $(git log -1 --pretty=format:'%h - %s (%an, %ar)')"
echo "- Estado PM2:"
pm2 list | grep "$APP_NAME"
