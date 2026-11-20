# Website editor: one-time account connection

The website content is in `data/site.json` and `data/projects.json`. The editor
at `/admin/` uses Decap CMS 3.18.0. Uploads go to `assets/uploads` and publication
commits to `main`; Cloudflare Pages deploys the changes automatically.

## GitHub App (owned by Rezarmdy)

Register a GitHub App in the owner's account with:

- Name: Reza Portfolio Editor (choose a unique suffix if already taken).
- Homepage: https://rezaromadoni.pages.dev
- Callback: https://rezaromadoni.pages.dev/api/callback
- Webhook: inactive. No webhook URL is needed.
- Repository permissions: Contents, read and write; Metadata, read only.
- Account permissions: none. Organisation permissions: none.
- Installation: only on the owner's account; select only `reza-portfolio`.
- Keep expiring user tokens enabled. No private key is needed for this flow.

The account owner must approve creation/installation and create the client
secret themselves. Do not paste a client secret into chat or commit it.

## Cloudflare Pages settings

Under the `rezaromadoni` project, add production variables:

- `GITHUB_CLIENT_ID`: the GitHub App client ID (not its numeric App ID).
- `GITHUB_CLIENT_SECRET`: encrypted Secret, entered directly by the owner.
- `ALLOWED_GITHUB_USERS`: optional; defaults to `Rezarmdy`.

Redeploy after setting variables. The function at `/api/status` reports only
whether the two required values are present; it never returns their values.
The OAuth callback validates CSRF state, PKCE, the owner allowlist and repository
write permission. The user token is further restricted to repository ID
1465606674 and delivered only to the editor's exact HTTPS origin.

## Editing

1. Open https://rezaromadoni.pages.dev/admin/ and log in with GitHub.
2. Open Website settings for hero, profile, tools, skill tags, language bars,
   CV, email, phone and social links.
3. Open Portfolio projects to add/reorder projects, choose a category, replace
   covers, upload gallery images, mark selected work, or hide a project.
4. Save/publish, wait for Cloudflare's deployment, then refresh the website.

Gallery images retain their original proportions. Square thumbnails use
contain, so no part of a design is hidden. Use high-resolution originals when
available: enlarging low-resolution PDF assets cannot restore missing detail.
