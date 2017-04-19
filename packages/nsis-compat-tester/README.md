
# nsis-compat-tester

The test case for `nsis-compat-updater`.

## Getting Started - Part Server

Serve those `*.exe` and `versions.nsis.json` in a directory via HTTP/HTTPS servers, and let's name the URL to the directory `feed`.

## Getting Started - Part App

* Install `nsis-compat-updater` and save as a `dependency`:

```
npm install nsis-compat-updater --save
```

* Import and setup `nsis-compat-updater` by passing in `feed`, `version` and `arch`.
* Combine `updater.checkForUpdates`, `updater.downloadUpdate` and `updater.quitAndInstall` to complete update logic.

See also [nsis-compat-updater](../nsis-compat-updater/).

## Test

```bash
npm install

npm run dist
npm run serve
```
