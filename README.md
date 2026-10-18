# VVJOB V1

Vietnamese workplace community built as an extension of NodeBB Harmony. Development branch: `dev`.

The custom `/vvjob` feed provides recent/popular discussions, weekly trending topics, permission-aware community navigation, native composer access, and responsive desktop/mobile layouts. The v0.6 global UI also styles the shared navigation, composer, authentication, profiles, settings, search, notifications, chats and admin components. NodeBB owns accounts, posts, replies, notifications, search, reports, and moderation. No core files are patched.

**Anonymous posting is unavailable. All posts remain associated with their accounts.** Recruiting, applications, and recruitment administration are outside V1.

## Build and test

Node.js 20+ (CI: 22):

```sh
npm ci --ignore-scripts
npm test
npm run build
```

This compiles both stylesheets and 36 owned Benchpress templates with available Harmony/composer imports. Generated `dist/` is validation output; NodeBB compiles the plugin itself during `nodebb build`.

Compatibility baseline inspected from source: NodeBB **4.6.1** (`351c9abc6f3016a55b34b6c791b85a7bb7f9a8d7`), Harmony **2.1.21**. The original server was inspected as NodeBB 1.19.7 on `nodebb/docker`; see the deployment record for the isolated upgrade and cutover. The original Compose remains unchanged.

- [Local installation](docs/LOCAL_SETUP.md)
- [Deployment and rollback](docs/DEPLOYMENT.md)
- [Changes and verification](docs/VALIDATION.md)
- [Conversation-first UI refresh](docs/UI_REFRESH.md)

- [Global UI and editor coverage](docs/GLOBAL_UI.md)

- [Route rebuild, category cleanup and verification](docs/DEEP_UI.md)

- [Vietnamese polish, onboarding acceptance and email configuration](docs/COMMUNITY_READINESS.md)

- [Composer close controls and compact homepage](docs/COMPACT_UI.md)

- [Company directory, optional career profiles and source/import workflow](docs/COMPANY_DIRECTORY.md)
