# VVJOB local development (NodeBB)

Requirements: Docker Desktop with Docker Compose, macOS.

```sh
git clone https://github.com/vnforver02/vvjob.git
cd vvjob
git checkout dev
docker compose up -d
docker compose logs -f nodebb
```

Visit **http://localhost:4567** on the same Mac. On the first launch follow the NodeBB installer; choose **Redis** with host `redis` and port `6379`. Complete the administrator account setup locally. Redis is not published to the host. The web service binds only to loopback.

The NodeBB image is currently tagged `latest` for bootstrapping only; pin to a tested immutable release before sharing a deployed environment.

To stop without deleting test data:
```sh
docker compose down
```

To inspect status:
```sh
docker compose ps
```

No automated deployment, no production service or domain, and no GitHub Actions are configured.

## VVJOB V1 scope

1. Vietnamese-first community (categories: Thảo luận công việc, Công ty, Lương & phúc lợi, Kinh nghiệm nghề nghiệp).
2. NodeBB registration, authentication, posts, replies, moderation and search.
3. VVJOB presentation/theme and navigation.
4. Anonymous discussions as a separate, security-reviewed feature. **Never treat a renamed account as anonymous.**
5. Company review and structured salary records after a basic moderation/privacy design is approved.

The `extensions/nodebb-plugin-vvjob` folder contains the first presentation extension prototype. It is not enabled in the Docker image automatically; activation and NodeBB-version compatibility testing are outstanding.
