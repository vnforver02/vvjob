# Docker / aaPanel deployment procedure

Production changes require user authorization. The user authorized the 2026-10-18 rollout and delegated the migration decision; see DEPLOYMENT_RESULT.md for the performed rollout. The owner also explicitly authorized the autonomous2026-10-31 review and release in this session. Other future deployments require authorization. Do not put panel, SSH, database passwords or tokens into Git or deployment notes.

## Before deployment

On an authorized staging environment, inspect the existing NodeBB container's image digest, NodeBB package version, Harmony version, working directory, config path, mounts, network, published ports, and reverse proxy. `nodebb/docker` and GHCR distributions must not be assumed to share paths. Compare against the inspected 4.6.1 / 2.1.21 baseline. For another version, verify its hooks/controllers and rerun integration tests before claiming compatibility.

Export/backup the database, config, uploads, active plugin list, theme and homepage settings. Protect backups as secrets. Record the current image digest and restore procedure. Rehearse restore on isolated volumes. Retain existing aaPanel proxy, TLS, networks and other containers.

## Staging

1. Pull `dev` and record the commit. Run `npm ci --ignore-scripts`, `npm test`, `npm run build`.
2. Mount/copy `extensions/nodebb-plugin-vvjob` into the staging NodeBB `node_modules/nodebb-plugin-vvjob`. Use paths verified for that image. Keep the package included in the deployment image/mount across container replacement.
3. Activate the plugin, run native `nodebb build` with the verified config path, restart staging. Set Harmony, Vietnamese, branding, categories and homepage as described in LOCAL_SETUP.
4. Execute every browser acceptance check in VALIDATION. Confirm a private category and its topics never appear for unauthorized viewers, including the trending rail and `/api/vvjob`.
5. Review the staged result and obtain explicit production confirmation. Only then schedule a maintenance window, back up again, and repeat the tested steps on the intended container.

Do not run the repository's development Compose on the existing production project or replace its volumes. Never auto-upgrade NodeBB or use a new `latest` image as part of UI rollout. Pin the tested image digest. This change provides no infrastructure migration or automatic production deployment.

## Rollback

Restore previous homepage/theme settings first, deactivate `nodebb-plugin-vvjob`, rebuild NodeBB and restart the intended container. Remove the plugin mount only after deactivation. Restore the prior image digest if it changed. The plugin persists career, company, reaction and private verification records in addition to native NodeBB content. Release0.11.0 introduces no database migration. For a UI rollback, restore the saved Compose plugin/build mounts and recreate only the web service. Do not restore an older database over new user activity unless a separate recovery decision requires it. Keep private evidence/configuration backups access-restricted.

## Reproducible release configuration

`compose.release.yml` provides the verified NodeBB 4.6.1 image digest, Harmony 2.1.21, PostgreSQL 18.1, persistent dependency/build/upload volumes, read-only plugin mount, loopback port 14567, and the required `CONFIG` environment variable. It is a reference for a separate release stack, not a drop-in replacement for an existing aaPanel project. Supply database credentials through a private environment file and provide the migrated `config/config.json` with database host `db`. Do not reuse old dependency volumes when changing the NodeBB image version.

Running `loader.js --config=...` alone does not select the loader configuration file; set `CONFIG=/opt/config/config.json`. Validate the existing virtual host before reload and retry HTTP checks briefly after reload so retiring Nginx workers do not cause a false rollback.

Release0.11.0 performed checks, exact backup paths and rollback procedure: [DELIVERY_REVIEW_20261031.md](DELIVERY_REVIEW_20261031.md).
