import {basename, resolve, win32} from 'path';

import {INsisComposerOptions, NsisComposer} from './NsisComposer';

export class Nsis7Zipper extends NsisComposer {

    public static async getMakeInstallerFiles(path: string): Promise<string> {
        return `SetOutPath "$INSTDIR"
SetCompress off
File "${ win32.normalize(resolve(path)) }"
Nsis7z::ExtractWithDetails "$OUTDIR\\${ basename(path) }" "$(INSTALLING) %s..."
Delete "$OUTDIR\\${ basename(path) }"`;
    }

    constructor(protected path: string, options: INsisComposerOptions) {
        super((options.solid = false, options));

    }

    protected async makeInstallerFiles(): Promise<string> {
        return await Nsis7Zipper.getMakeInstallerFiles(this.path);
    }

}
