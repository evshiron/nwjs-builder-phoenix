
import { dirname, basename, join, relative, resolve, win32 } from 'path';

import { NsisComposer, INsisComposerOptions } from './NsisComposer';

export class Nsis7Zipper extends NsisComposer {

    constructor(protected path: string, options: INsisComposerOptions) {
        super((options.solid = false, options));

    }

    protected async makeInstallerFiles(): Promise<string> {
        return `SetOutPath "$INSTDIR"
SetCompress off
DetailPrint "Extracting archive..."
File "${ win32.normalize(resolve(this.path)) }"
DetailPrint "Installing archive..."
Nsis7z::ExtractWithDetails "$OUTDIR\\${ basename(this.path) }" "Installing %s..."
Delete "$OUTDIR\\${ basename(this.path) }"`;
    }

}
