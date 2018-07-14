
import { spawn } from 'child_process';
import * as Debug from 'debug';
import { dirname, resolve, win32 } from 'path';

export * from './NsisComposer';
export * from './NsisDiffer';
export * from './Nsis7Zipper';

const debug = Debug('nwjs-builder-phoenix:nsis-gen:downloader');
const DIR_ASSETS = resolve(dirname(module.filename), '../../../assets/');
const DIR_NSIS = resolve(DIR_ASSETS, 'nsis');

interface INsisBuildOptions {
    mute: boolean;
}

export async function nsisBuild(cwd: string, script: string, options: INsisBuildOptions = {
    mute: false,
}) {

    const args = [ win32.normalize(resolve(DIR_NSIS, 'makensis.exe')), '/NOCD', '/INPUTCHARSET', 'UTF8', win32.normalize(resolve(script)) ];

    debug(`spawning command ${args.join(' ')} with cwd ${cwd}`);
    if(process.platform != 'win32') {
        args.unshift('wine');
    }

    const child = spawn(args.shift(), args, {
        cwd,
    });

    await new Promise((resolve, reject) => {

        child.on('error', reject);
        child.on('close', (code, signal) => {

            if(code != 0) {
                return reject(new Error(`ERROR_EXIT_CODE code = ${ code }`));
            }

            resolve({ code, signal });

        });

        if(!options.mute) {
            child.stdout.pipe(process.stdout);
            child.stderr.pipe(process.stderr);
        }

    });

}
