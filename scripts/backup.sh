echo "Starting backup of Lawyer CRM..."

# Backup PostgreSQL database
echo "Backing up PostgreSQL database..."
docker-compose -f docker-compose.prod.yml exec db pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > backups/db_backup_$(date +%Y%m%d%H%M%S).sql

# Backup Redis data
echo "Backing up Redis data..."
docker-compose -f docker-compose.prod.yml exec redis redis-cli -a ${REDIS_PASSWORD} SAVE
docker cp lawyer_crm_redis_prod:/data backups/redis_backup_$(date +%Y%m%d%H%M%S)

# Backup MinIO data
echo "Backing up MinIO data..."
docker cp lawyer_crm_minio_prod:/data backups/minio_backup_$(date +%Y%m%d%H%M%S)

echo "Backup completed. Files are located in the backups/ directory."