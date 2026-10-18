# Docker / aaPanel deployment procedure

Production changes require explicit confirmation. No server has been accessed or changed during this implementation. Do not put panel, SSH, database passwords or tokens into Git or deployment notes.

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

Restore previous homepage/theme settings first, deactivate `nodebb-plugin-vvjob`, rebuild NodeBB and restart the intended container. Remove the plugin mount only after deactivation. Restore the prior image digest if it changed. This plugin writes no business data and requires no database migration. Database restore is needed only for unrelated configuration/data damage; use the rehearsed backup procedure.
