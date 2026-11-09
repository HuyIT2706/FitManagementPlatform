#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# NutriCore PostgreSQL Disaster Recovery / Restore Script
# Usage:
#   ./scripts/restore-db.sh <path_to_backup.sql.gz>
# ==============================================================================

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup_file.sql.gz>" >&2
  exit 1
fi

BACKUP_FILE="$1"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
DOCKER_CONTAINER="${DOCKER_DB_CONTAINER:-fit_db_prod}"
PG_USER="${POSTGRES_USER:-postgres}"
PG_DB="${POSTGRES_DB:-fit_management_db}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file not found: ${BACKUP_FILE}" >&2
  exit 1
fi

if [ -f "${CHECKSUM_FILE}" ]; then
  echo "Verifying SHA-256 checksum..."
  sha256sum -c "${CHECKSUM_FILE}"
fi

echo "Verifying gzip archive integrity..."
gzip -t "${BACKUP_FILE}"

echo "⚠️  WARNING: This will overwrite database '${PG_DB}' with data from '${BACKUP_FILE}'."
read -r -p "Are you sure you want to proceed? (yes/NO): " CONFIRM
if [ "${CONFIRM}" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "[$(date -Iseconds)] Restoring database from ${BACKUP_FILE}..."

if [ -n "${DATABASE_URL:-}" ]; then
  gunzip -c "${BACKUP_FILE}" | psql "${DATABASE_URL}"
elif docker ps --format '{{.Names}}' | grep -q "^${DOCKER_CONTAINER}$"; then
  gunzip -c "${BACKUP_FILE}" | docker exec -i "${DOCKER_CONTAINER}" psql -U "${PG_USER}" -d "${PG_DB}"
else
  echo "ERROR: Neither DATABASE_URL is set nor Docker container '${DOCKER_CONTAINER}' is running." >&2
  exit 1
fi

echo "[$(date -Iseconds)] Database restore completed successfully."

