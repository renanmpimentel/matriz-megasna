# Data Sync and Footer Accuracy Design

## Context

The application is a static Vite site published on GitHub Pages. A scheduled GitHub Actions workflow fetches Mega-Sena draws from the Caixa API and commits the updated JSON to `main`. A separate workflow deploys the site on pushes to `main`.

Automated pushes made with the repository `GITHUB_TOKEN` do not trigger the deploy workflow. As a result, the repository data continued to advance while the published Pages artifact remained frozen at draw 2985 from 17/03/2026. The footer compounded the confusion by labeling the browser's current time as the last update time.

## Goals

- Publish new draw data during the same scheduled run that synchronizes it.
- Keep the existing push-triggered deployment for human-authored application changes.
- Commit `meta.json` whenever draw data changes so the deployed artifact carries an accurate data-update timestamp.
- Display the metadata timestamp in the footer instead of the browser load time.
- Preserve the last draw date as a distinct value.
- Add automated regression coverage for the footer and workflow contracts.

## Architecture

The scheduled workflow remains responsible for data synchronization and validation. It will detect whether `sorteios.json` changed and, when it did, commit both `sorteios.json` and `meta.json`, build the site, and upload the Pages artifact from the same job and working tree. A dependent deployment job will publish that already-built artifact without checking out the repository again. This prevents a later checkout from resolving to the workflow's original commit instead of the data commit created during the run.

The existing Pages workflow remains unchanged in purpose: it deploys application changes pushed by a person to `main`. Both workflows will use the same repository-wide `github-pages` concurrency group so that an older deployment cannot finish after and replace a newer one. Automated data publication no longer depends on the push workflow being triggered recursively.

The daily workflow will explicitly receive `contents: write`, `pages: write`, and `id-token: write` permissions and will use the standard `configure-pages`, `upload-pages-artifact`, and `deploy-pages` actions under the `github-pages` environment.

The frontend will fetch `meta.json` alongside `sorteios.json`, but metadata loading will be independently guarded so its failure cannot reject draw loading. A small pure status-label module will format the footer from `updatedAt` and the latest draw date. If metadata cannot be loaded or parsed, the application will continue rendering the draws and explicitly report that the data update time is unavailable.

## Data Flow

1. The scheduled job runs `npm run sync:data`.
2. The sync script fetches the latest Caixa draw and updates both JSON files when new draws exist.
3. The workflow records whether `sorteios.json` changed.
4. If changed, the same job commits both data and metadata files and pushes `main`.
5. That job builds and uploads the artifact from its already-updated working tree.
6. A dependent job deploys the uploaded artifact without another checkout.
7. The browser loads `sorteios.json` and `meta.json` from the same deployed artifact.
8. The footer shows the metadata timestamp and the date of the highest-numbered draw.

## Error Handling

- A failed Caixa request continues to preserve the existing local database as the sync script does today.
- A missing or invalid `meta.json` does not prevent the draw table from loading.
- The footer uses an explicit unavailable-state message instead of substituting the browser clock.
- The deploy job runs only when draw data changed and only after the sync/build job succeeds.

## Testing

- Unit tests cover footer labels with valid metadata, missing metadata, invalid timestamps, and missing draw dates.
- Contract tests read the workflow YAML as text and assert that the daily workflow stages both data files and contains a conditional Pages deployment path.
- The existing lint, typecheck, unit-test, and static-build commands form the final verification gate.

## Non-goals

- Replacing the Caixa API.
- Adding a backend or runtime database.
- Changing draw calculations, filters, strategy ranking, or visual layout.
- Introducing a personal access token or GitHub App solely to trigger another workflow.
