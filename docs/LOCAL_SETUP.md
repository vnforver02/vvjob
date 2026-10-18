# Local development

Requires Docker Compose, Node.js 20+, and an inspected NodeBB image with the official image's `/usr/src/app` and `/opt/config` layout. The existing `docker-compose.yml` is preserved. `compose.dev.yml` is a separate stack with separate volumes and port 14567. Do not attach it to production data or run it with production Compose files.

```sh
git clone --branch dev https://github.com/vnforver02/vvjob.git
cd vvjob
npm ci --ignore-scripts
npm test
npm run build
cp .env.example .env
# Set NODEBB_IMAGE to an inspected release/digest compatible with NodeBB 4.6.1.
docker compose --env-file .env -f compose.dev.yml config --quiet
docker compose --env-file .env -f compose.dev.yml up -d
```

Open http://localhost:14567 and complete the native installer. Set forum URL to `http://localhost:14567`; Redis host `redis`, port `6379`. Create the administrator locally. No credentials should be placed in source control. A different Docker distribution (including `nodebb/docker`) may use different paths: inspect its version, working directory, entrypoint and volumes before adapting this file.

After setup, in this **development** stack only:

```sh
docker compose -f compose.dev.yml exec nodebb ./nodebb activate nodebb-plugin-vvjob --config=/opt/config/config.json
docker compose -f compose.dev.yml exec nodebb ./nodebb build --config=/opt/config/config.json
docker compose -f compose.dev.yml restart nodebb
```

In ACP:

1. Select Harmony; verify version 2.1.21. Keep the native composer, markdown, search and moderation plugins active.
2. Set site title/browser title to `VVJOB`, default language to `vi`, and homepage to `VVJOB — Bảng tin` (`vvjob`). Existing users may need to reset personal homepage/language preferences.
3. Create real categories: `Thảo luận công việc`, `Thảo luận công ty`, `Lương & phúc lợi`, `Kinh nghiệm nghề nghiệp`. Configure guest/member read and posting privileges explicitly. Category IDs/slugs are read dynamically; no assumed IDs or global search substitutes.
4. Do not create a public anonymous-posting category. The sidebar explains that anonymous exchange is unavailable.
5. Add `/vvjob` as the main navigation/home link. Keep native notifications, search and user menus available.

Visit `/vvjob` before switching the homepage. The plugin does not automatically mutate site settings, categories, or existing user preferences. An empty database displays an honest empty state.

Stop while preserving development data:

```sh
docker compose -f compose.dev.yml down
```

Never use `down -v` against existing data. The custom plugin is mounted read-only at its package location. Rebuild NodeBB and restart after template/style changes. No production deployment runs automatically.
