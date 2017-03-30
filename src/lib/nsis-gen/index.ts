
import { dirname, resolve, win32 } from 'path';
import { spawn } from 'child_process';

export * from './NsisComposer';

const DIR_ASSETS = resolve(dirname(module.filename), '../../../assets/');
const DIR_NSIS = resolve(DIR_ASSETS, 'nsis');

interface INsisBuildOptions {
    mute: boolean;
}

export async function nsisBuild(script: string, options: INsisBuildOptions = {
    mute: false,
}) {

    const args = [ win32.normalize(resolve(DIR_NSIS, 'makensis.exe')), win32.normalize(resolve(script)) ];
    if(process.platform != 'win32') {
        args.unshift('wine');
    }

    const child = spawn(args.shift(), args);

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
