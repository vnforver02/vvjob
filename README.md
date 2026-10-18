# VVJOB V1

Vietnamese workplace community built as an extension of NodeBB Harmony. Development branch: `dev`.

The custom `/vvjob` feed provides recent/popular discussions, weekly trending topics, permission-aware community navigation, native composer access, and responsive desktop/mobile layouts. NodeBB owns accounts, posts, replies, notifications, search, reports, and moderation. No core files are patched.

**Anonymous posting is unavailable. All posts remain associated with their accounts.** Recruiting, applications, and recruitment administration are outside V1.

## Build and test

Node.js 20+ (CI: 22):

```sh
npm ci --ignore-scripts
npm test
npm run build
```

This compiles the extension's Sass and Benchpress template using Harmony's paginator. Generated `dist/` is validation output; NodeBB compiles the plugin itself during `nodebb build`.

Compatibility baseline inspected from source: NodeBB **4.6.1** (`351c9abc6f3016a55b34b6c791b85a7bb7f9a8d7`), Harmony **2.1.21**. The running server version has not been inspected. The original Compose uses `latest`; it does not establish a runtime version.

- [Local installation](docs/LOCAL_SETUP.md)
- [Deployment and rollback](docs/DEPLOYMENT.md)
- [Changes and verification](docs/VALIDATION.md)
