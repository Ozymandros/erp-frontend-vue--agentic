# vue-project

ERP frontend (Vue + Vite + Vuetify).

## Dependency security

This project uses pnpm supply-chain settings via [`.npmrc`](.npmrc):

- [`minimumReleaseAge`](https://pnpm.io/settings#minimumreleaseage) (24 hours) — delays installing newly published versions.
- [`blockExoticSubdeps`](https://pnpm.io/settings#blockexoticsubdeps) — blocks transitive dependencies from git/tarball URLs; only direct `package.json` dependencies may use exotic sources.

CI installs with `pnpm install --frozen-lockfile`, so routine builds keep using locked versions. The delay mainly affects `pnpm add`, `pnpm update`, and fresh installs when the lockfile changes.

### Bypassing the delay

Use one of these when an urgent patch must land immediately:

1. Temporarily set `minimum-release-age=0` in `.npmrc`, install, then restore `1440`.
2. Add a package to `.npmrc`: `minimum-release-age-exclude[]=package-name`
3. Pin a specific version: `minimum-release-age-exclude[]=package@1.2.3`

Continue running `pnpm audit` in CI alongside this setting.
