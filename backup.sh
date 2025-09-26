#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="backups"
PROJECT_NAME="jewelia-crm-login"

mkdir -p $BACKUP_DIR
zip -r "$BACKUP_DIR/${PROJECT_NAME}_backup_$DATE.zip" . -x "node_modules/*" ".git/*" "backups/*"
echo "Backup created: $BACKUP_DIR/${PROJECT_NAME}_backup_$DATE.zip"
