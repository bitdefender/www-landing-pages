# AGENTS.md

Bitdefender landing pages on AEM Edge Delivery Services. Read an existing block before writing one. This repo is not the stock boilerplate: where a skill or general EDS advice conflicts with this file, this file wins.

## Layout
- Code lives in `_src-lp/`: `blocks/{name}/{name}.{js,scss,css}`, `scripts/`, `styles/`. There is no root `blocks/`.
- `_src-lp/scripts/lib-franklin.js` is the team's fork of the AEM core library (there is no `aem.js`). Edit it carefully; many blocks depend on it.
- Content is authored in SharePoint Word docs (`fstab.yaml`, still in use). Ignore skills for Document Authoring (da.live), Universal Editor, and page import.

## Avoid
- Editing a compiled `.css` when a `.scss` exists. Edit the `.scss`, let `npm run compile-sass` (or `npm run up`) compile it, commit both. CSS-only blocks are edited directly.
- Guessing markup. Content comes from the backend: `curl localhost:3000/path.plain.html` first. Authors omit and add cells, so decorate defensively.
- Unscoped CSS. Scope to `.blockname`; `-wrapper`/`-container` are section classes.
- Adding runtime npm packages casually. They load from esm.sh via the import map in `head.html`, which the pre-commit hook regenerates from `package.json`.
- Running `npm run test:accept-baseline`. Ghost Inspector baselines are owned by someone else.

## Commands
- `npm run up`: Sass watcher + `aem up` at `localhost:3000` (local code, previewed content). Add `--html-folder drafts` to `aem up` for static test pages in `drafts/`.
- `npm run lint`, `npm run test:unit` (vitest; specs in `_src-lp/blocks/*/__TESTS__/` and `jest/__TESTS__/`). The pre-commit hook runs both.
- `npm run purge-css` after using new Bootstrap classes.

## Remember
- Commits: `DEX-xxxxx | type: message` (e.g. `DEX-28804 | fix: ...`).
- Every PR needs a preview link: `https://{branch}--www-landing-pages--bitdefender.aem.page/{path}`.
- Merging `main` ships code; content publishes separately.
- All committed files are served unless listed in `.hlxignore`. Never commit secrets.
- Skills: `.agents/skills/` (Codex, Copilot). Claude Code: `aem-edge-delivery-services@adobe-skills` plugin. Docs: https://www.aem.live/docs/
