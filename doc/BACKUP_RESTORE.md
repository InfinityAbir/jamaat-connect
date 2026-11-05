# Backup and Restore (PostgreSQL)

Jamaat Connect stores all data in PostgreSQL. The Docker Compose setup keeps it in the named volume `postgres_data`, served by the container `jamaat_connect_db`. The commands below assume the default values from `.env.example`. Replace the user and database names if you changed them.

> Backups contain private contact details (submitter phone numbers, enquiries). Store them encrypted, restrict access, and never commit them to git.

---

## 1. What to back up

| Item | Where | Notes |
|---|---|---|
| Database | `postgres_data` volume | Everything: listings, users, enquiries, moderation history, locations |
| Configuration | `.env` | Contains secrets. Keep it in a password manager or secrets store, not in the same place as DB dumps |

The API and frontend containers are stateless and can be rebuilt from source.

---

## 2. Create a backup

Use a compressed custom-format dump. It is small and supports selective restore.

```bash
mkdir -p backups
docker exec jamaat_connect_db pg_dump -U jamaat_user -d jamaat_connect_dev -Fc \
  > backups/jamaat_connect_$(date +%Y%m%d_%H%M%S).dump
```

On Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force backups | Out-Null
$file = "backups\jamaat_connect_$(Get-Date -Format yyyyMMdd_HHmmss).dump"
docker exec jamaat_connect_db pg_dump -U jamaat_user -d jamaat_connect_dev -Fc -f /tmp/backup.dump
docker cp jamaat_connect_db:/tmp/backup.dump $file
docker exec jamaat_connect_db rm /tmp/backup.dump
```

(PowerShell's `>` redirect re-encodes binary output, so dump inside the container and copy the file out.)

### Verify the backup

```bash
docker exec -i jamaat_connect_db pg_restore --list < backups/<file>.dump | head
```

A readable table of contents means the file is intact. Periodically do a full test restore (section 4) into a scratch database.

---

## 3. Restore

Restoring **replaces existing data**. Take a fresh backup first if the current database holds anything you need.

```bash
# 1. Stop the API so nothing writes during the restore
docker compose stop api

# 2. Recreate an empty database
docker exec jamaat_connect_db psql -U jamaat_user -d postgres \
  -c "DROP DATABASE IF EXISTS jamaat_connect_dev;" \
  -c "CREATE DATABASE jamaat_connect_dev OWNER jamaat_user;"

# 3. Restore the dump
docker exec -i jamaat_connect_db pg_restore -U jamaat_user -d jamaat_connect_dev \
  --no-owner --exit-on-error < backups/<file>.dump

# 4. Start the API again
docker compose start api
```

The API applies any pending EF Core migrations on startup, so restoring an older dump into a newer build is safe.

### Smoke test after restoring
- `curl http://localhost:5000/health/ready` returns `200`.
- The listing search page shows the expected listings.
- A moderator can open the moderation queue.

---

## 4. Test a restore without touching live data

```bash
docker exec jamaat_connect_db psql -U jamaat_user -d postgres -c "CREATE DATABASE restore_test;"
docker exec -i jamaat_connect_db pg_restore -U jamaat_user -d restore_test --no-owner < backups/<file>.dump
docker exec jamaat_connect_db psql -U jamaat_user -d restore_test -c "SELECT count(*) FROM listings;"
docker exec jamaat_connect_db psql -U jamaat_user -d postgres -c "DROP DATABASE restore_test;"
```


---

## 5. Recommended routine

| What | Frequency | Keep |
|---|---|---|
| Automated dump | Daily | 7 daily + 4 weekly + 3 monthly |
| Off-machine copy | Daily | Encrypted, in a different location from the server |
| Test restore | Monthly | Record the date and result |
| Pre-deployment dump | Before every release or migration | Until the release is stable |

Example cron entry on a Linux host (daily at 02:00, deletes dumps older than 30 days):

```cron
0 2 * * * cd /opt/jamaat-connect && docker exec jamaat_connect_db pg_dump -U jamaat_user -d jamaat_connect_dev -Fc > backups/jamaat_$(date +\%Y\%m\%d).dump && find backups -name '*.dump' -mtime +30 -delete
```

---

## 6. Wiping the volume (disaster reset)

`docker compose down -v` deletes `postgres_data` and **all data**. Use it only on a development machine, or after you have verified a backup. A clean start re-runs migrations and seed data automatically.
