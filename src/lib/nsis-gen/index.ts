
import { dirname, resolve, win32 } from 'path';
import { spawn } from 'child_process';

export * from './NsisComposer';
export * from './NsisDiffer';

const DIR_ASSETS = resolve(dirname(module.filename), '../../../assets/');
const DIR_NSIS = resolve(DIR_ASSETS, 'nsis');

interface INsisBuildOptions {
    defines: { [key: string]: string };
    mute: boolean;
}

export async function nsisBuild(cwd: string, script: string, options: INsisBuildOptions = {
    defines: {},
    mute: false,
}) {

    options.defines = options.defines ? options.defines : {};
    options.mute = options.mute ? true : false;

    const args = [ win32.normalize(resolve(DIR_NSIS, 'makensis.exe')), '/WX', '/NOCD' ];

    for(const key in options.defines) {
        args.push(`/D${ key }="${ options.defines[key] }"`);
    }

    if(process.platform != 'win32') {
        args.unshift('wine');
    }

    args.push(win32.normalize(resolve(script)));

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
