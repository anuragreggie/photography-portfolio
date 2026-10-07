# Photography portfolio

A React Router single-page photography portfolio with Mantine, responsive WebP galleries, and a keyboard-accessible lightbox.

## Development

Use Node.js 22 and npm:

```bash
npm ci
npm run dev
```

## Verification and builds

```bash
npm run check       # Lint, TypeScript, image-pipeline tests, formatting
npm run build       # Regenerate photo metadata/variants and build the site
npm start           # Preview build/client locally
```

`npm run build:quick` builds the app using existing image metadata and variants. Use it for changes that do not modify photographs.

## Images and icons

See [the image management guide](docs/IMAGE-MANAGEMENT.md) for adding photographs and locations. To regenerate the portrait favicon and Apple touch icon from `app/assets/icons/tab-portrait.webp`, run `npm run icons:generate`.

## Deployment

Pushing to `master` runs validation and a full build, then uploads `build/client` to Hostinger via the GitHub Actions workflow. Deployments are serialized to prevent overlapping uploads. GitHub repository secrets `FTP_HOST`, `FTP_USERNAME`, and `FTP_PASSWORD` must be configured.

`public/.htaccess` supplies Apache caching headers and the SPA fallback for direct visits to `/gallery` and `/about`. Local Vite preview does not validate Apache configuration.
