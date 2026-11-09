#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# NutriCore Automated PostgreSQL Backup Script
# Usage:
#   ./scripts/backup-db.sh
# Environment variables (or .env):
#   DATABASE_URL          - Full PostgreSQL connection string (optional if using Docker)
#   DOCKER_DB_CONTAINER   - Docker container name (default: fit_db_prod)
#   POSTGRES_USER         - DB User (default: postgres)
#   POSTGRES_DB           - DB Name (default: fit_management_db)
#   BACKUP_DIR            - Output directory (default: ./backups)
#   BACKUP_RETENTION_DAYS - Retention days before auto-prune (default: 30)
#   BACKUP_WEBHOOK_URL    - Optional Discord/Slack webhook URL for status alerts
# ==============================================================================

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DOCKER_CONTAINER="${DOCKER_DB_CONTAINER:-fit_db_prod}"
PG_USER="${POSTGRES_USER:-postgres}"
PG_DB="${POSTGRES_DB:-fit_management_db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nutricore_db_${TIMESTAMP}.sql.gz"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

mkdir -p "${BACKUP_DIR}"

notify_webhook() {
  local message="$1"
  if [ -n "${BACKUP_WEBHOOK_URL:-}" ]; then
    curl -s -X POST -H "Content-Type: application/json" \
      -d "{\"content\": \"${message}\"}" \
      "${BACKUP_WEBHOOK_URL}" > /dev/null || true
  fi
}

echo "[$(date -Iseconds)] Starting PostgreSQL backup..."

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Mode: Direct pg_dump via DATABASE_URL"
  pg_dump "${DATABASE_URL}" --no-owner --no-acl --clean --if-exists | gzip -9 > "${BACKUP_FILE}"
elif docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER}$"; then
  echo "Mode: Docker container exec (${DOCKER_CONTAINER})"
  docker exec -t "${DOCKER_CONTAINER}" pg_dump -U "${PG_USER}" -d "${PG_DB}" --no-owner --no-acl --clean --if-exists | gzip -9 > "${BACKUP_FILE}"
else
  echo "ERROR: Neither DATABASE_URL is set nor Docker container '${DOCKER_CONTAINER}' is running." >&2
  notify_webhook "❌ NutriCore DB Backup FAILED on $(hostname) at $(date -Iseconds): No DB target found."
  exit 1
fi

# Verify gzip integrity
if ! gzip -t "${BACKUP_FILE}"; then
  echo "ERROR: Backup archive integrity check failed!" >&2
  rm -f "${BACKUP_FILE}"
  notify_webhook "❌ NutriCore DB Backup FAILED on $(hostname): Corrupted gzip archive."
  exit 1
fi

# Generate SHA-256 checksum
sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)

echo "[$(date -Iseconds)] Backup succeeded: ${BACKUP_FILE} (${FILESIZE})"

# Prune backups older than RETENTION_DAYS
PRUNED_COUNT=$(find "${BACKUP_DIR}" -name "nutricore_db_*.sql.gz*" -type f -mtime +"${RETENTION_DAYS}" -print -delete | wc -l)
echo "[$(date -Iseconds)] Pruned ${PRUNED_COUNT} old backup file(s) (> ${RETENTION_DAYS} days)."

notify_webhook "✅ NutriCore DB Backup SUCCESS: ${BACKUP_FILE} (${FILESIZE}). Retained ${RETENTION_DAYS}d."

