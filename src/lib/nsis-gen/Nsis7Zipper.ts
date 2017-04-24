
import { dirname, basename, join, relative, resolve, win32 } from 'path';

import { NsisComposer, INsisComposerOptions } from './NsisComposer';

export class Nsis7Zipper extends NsisComposer {

    constructor(protected path: string, options: INsisComposerOptions) {
        super((options.solid = false, options));

    }

    protected async makeInstallerFiles(): Promise<string> {
        return `SetOutPath "$INSTDIR"
SetCompress off
File "${ win32.normalize(resolve(this.path)) }"
Nsis7z::ExtractWithDetails "$OUTDIR\\${ basename(this.path) }" "$(INSTALLING) %s..."
Delete "$OUTDIR\\${ basename(this.path) }"`;
    }

}
