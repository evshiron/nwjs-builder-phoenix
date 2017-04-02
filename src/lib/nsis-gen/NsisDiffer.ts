
import { dirname, join, relative, resolve, win32 } from 'path';

const dircompare = require('dir-compare');

import { NsisComposer, INsisComposerOptions } from './NsisComposer';

export class NsisDiffer extends NsisComposer {

    constructor(protected fromDir: string, protected toDir: string, options: INsisComposerOptions) {
        super(options);

    }

    // Overrided, https://github.com/Microsoft/TypeScript/issues/2000.
    protected async makeInstallerFiles(): Promise<string> {

        const result = await dircompare.compare(this.fromDir, this.toDir, {
            compareSize: true,
            compareDate: true,
        });

        const lines: string[] = [];

        for(const diff of result.diffSet) {

            if(diff.type1 == 'missing' && diff.type2 == 'file') {
                lines.push(await this.makeWriteFile(diff.path2, '.' + diff.relativePath, diff.name2));
            }
            else if(diff.type1 == 'file' && diff.type2 == 'missing') {
                lines.push(await this.makeRemoveFile(diff.path1, '.' + diff.relativePath, diff.name1));
            }
            else if(diff.type1 == 'directory' && diff.type2 == 'missing') {
                lines.push(await this.makeRemoveDir(diff.path1, '.' + diff.relativePath, diff.name1));
            }
            else if(diff.type1 == 'file' && diff.type2 == 'file' && diff.state == 'distinct') {
                lines.push(await this.makeWriteFile(diff.path2, '.' + diff.relativePath, diff.name2));
            }

        }

        return lines.join('\n');

    }

    protected async makeRemoveFile(rootDir: string, relativeDir: string, filename: string): Promise<string> {
        return `Delete "$INSTDIR\\${ win32.normalize(join(relativeDir, filename)) }"`;
    }

    protected async makeWriteFile(rootDir: string, relativeDir: string, filename: string): Promise<string> {
        return `SetOutPath "$INSTDIR\\${ win32.normalize(relativeDir) }"
File "${ win32.normalize(resolve(rootDir, filename)) }"`;
    }

    protected async makeRemoveDir(rootDir: string, relativeDir: string, filename: string): Promise<string> {
        return `RMDir /r "$INSTDIR\\${ win32.normalize(join(relativeDir, filename)) }"`;
    }

}
