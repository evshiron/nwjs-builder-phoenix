
# nsis-compat-updater

`nsis-compat-updater` is an auto updater implementation for NW.js, inspired by `electron-updater`.

## API

### Imports

```javascript
import { NsisCompatUpdater } from 'nsis-compat-updater';
// Or
// const { NsisCompatUpdater } = require('nsis-compat-updater');
```

### Types

```typescript

interface IInstaller {
    arch: string;
    path: string;
    hash: string;
    created: number;
}

interface IUpdater {
    arch: string;
    fromVersion: string;
    path: string;
    hash: string;
    created: number;
}

interface IVersion {
    version: string;
    changelog: string;
    source: string;
    installers: IInstaller[];
    updaters: IUpdater[];
}

```

### `new NsisCompatUpdater(feed: string, version: string, arch: 'x86' | 'x64')`

```javascript
const updater = new NsisCompatUpdater(feed, version, arch);
```

### `updater.checkForUpdates(): Promise<IVersion | null>`

Returns an instance of `IVersion` if new version is available, otherwise `null`.

### `updater.downloadUpdate(version: string): Promise<string>`

Returns the temporary path of the downloaded update.

### `updater.quitAndInstall(path: string)`

### ~~`updater.installWhenQuit(path: string)`~~
