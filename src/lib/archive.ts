
import { dirname, basename, join, resolve, normalize } from 'path';

import { removeAsync, writeFileAsync } from 'fs-extra-promise';
import { path7za } from '7zip-bin';

const debug = require('debug')('build:archive');

import { tmpFile, spawnAsync } from './util';

export async function extract(archive: string, dest: string = dirname(archive)) {

    debug('in extract', 'archive', archive);
    debug('in extract', 'dest', dest);

    const { code, signal } = await spawnAsync(path7za, [ 'x', '-y', `-o${ resolve(dest) }`, resolve(archive) ]);

    if(code == 2) {
        throw new Error(`ERROR_PATH_NOT_FOUND path = ${ archive }`);
    }

    if(code != 0) {
        throw new Error(`ERROR_EXIT_CODE code = ${ code }`);
    }

    return dest;

}

export async function extractTarGz(archive: string, dest: string = dirname(archive)) {

    await extract(archive, dest);

    const tar = join(dest, basename(archive.slice(0, -3)));

    await extract(tar, dest);

    await removeAsync(tar);

}

export async function compress(dir: string, files: string[], type: string, archive: string) {

    debug('in compress', 'dir', dir);
    debug('in compress', 'files', files);
    debug('in compress', 'type', type);
    debug('in compress', 'archive', archive);

    const { path: listfiles, cleanup } = await tmpFile();

    debug('in compress', 'listfiles', listfiles);

    await writeFileAsync(listfiles, files.map(file => normalize(file)).join('\r\n'));

    const { code, signal } = await spawnAsync(path7za, [ 'a', `-t${ type }`, resolve(archive), `@${ resolve(listfiles) }` ], {
        cwd: dir,
    });

    cleanup();

    return code;

}
