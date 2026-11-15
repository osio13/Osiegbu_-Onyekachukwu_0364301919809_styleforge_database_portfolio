# Backup and Restore Exercise

Use a disposable target database and record timestamps, tool versions, database size, and validation results.

```bash
pg_dump --format=custom --file=styleforge.dump "$DATABASE_URL"
createdb styleforge_restore_test
pg_restore --dbname=styleforge_restore_test --clean --if-exists styleforge.dump
psql styleforge_restore_test -c "SELECT count(*) FROM orders;"
```

Do not commit the dump if it contains sensitive data. Capture the command output and checksums as evidence, then securely remove local test artefacts when no longer needed.
