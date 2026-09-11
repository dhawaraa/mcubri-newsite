#!/bin/bash
# ==============================================================================
# Automated Database Backup & Encryption Script (Anti-Ransomware)
# BRIMCU Website - Production Database
# ==============================================================================

set -eo pipefail

BACKUP_DIR="/var/backups/brimcu"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="db_backup_${TIMESTAMP}.sql.gz"
ENC_FILENAME="${FILENAME}.gpg"
CONTAINER_NAME="${DB_CONTAINER_NAME:-faculty-app-db-1}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-ums}"
RETENTION_DAYS=14

# 1. สร้างโฟลเดอร์สำหรับเก็บ Backup
mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting automated database backup for: ${DB_NAME}..."

# 2. ทำ pg_dump ผ่าน Docker Container และบีบอัดด้วย gzip ทันที
docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_DIR}/${FILENAME}"

echo "[$(date)] Database dumped successfully: ${FILENAME} ($(du -sh "${BACKUP_DIR}/${FILENAME}" | cut -f1))"

# 3. เข้ารหัสไฟล์ Backup ด้วย GPG (ป้องกัน Ransomware แอบอ่านข้อมูล หรือใช้รหัสผ่านสมมาตร)
if [ -n "${BACKUP_PASSPHRASE}" ]; then
  echo "[$(date)] Encrypting backup with GPG AES256..."
  gpg --batch --yes --passphrase "${BACKUP_PASSPHRASE}" --symmetric --cipher-algo AES256 -o "${BACKUP_DIR}/${ENC_FILENAME}" "${BACKUP_DIR}/${FILENAME}"
  rm -f "${BACKUP_DIR}/${FILENAME}"
  echo "[$(date)] Encrypted backup created: ${ENC_FILENAME}"
fi

# 4. ล้างไฟล์ Backup เก่าที่เกินอายุ Retention
echo "[$(date)] Cleaning up local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "db_backup_*.gz*" -mtime +${RETENTION_DAYS} -delete

# 5. Off-site Sync (ตัวอย่างการส่งไปยัง Cloud Storage เช่น AWS S3 / Cloudflare R2 / Remote SFTP)
# if command -v aws &> /dev/null && [ -n "${S3_BUCKET}" ]; then
#   echo "[$(date)] Uploading to off-site S3 storage..."
#   aws s3 cp "${BACKUP_DIR}/${ENC_FILENAME}" "s3://${S3_BUCKET}/backups/${ENC_FILENAME}"
# fi

echo "[$(date)] Backup process completed successfully."
