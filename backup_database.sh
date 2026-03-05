#!/bin/bash
# Respaldo completo de la base de datos PostgreSQL
# Cambia los valores de usuario, base y host según tu configuración
PGUSER="postgres"
PGDATABASE="monkey_ranch"
PGHOST="localhost"
PGPORT="5432"
BACKUP_DIR="backups"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p "$BACKUP_DIR"
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -F c -b -v -f "$BACKUP_FILE" "$PGDATABASE"

echo "Respaldo completo guardado en $BACKUP_FILE"
