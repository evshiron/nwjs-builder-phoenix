
import { dirname, resolve, normalize } from 'path';
import { spawn } from 'child_process';

export * from './NsisComposer';

const DIR_ASSETS = resolve(dirname(module.filename), '../../assets/');
const DIR_NSIS = resolve(DIR_ASSETS, 'nsis');

export async function nsisBuild(script: string) {

    const args = [ normalize(resolve(DIR_NSIS, 'makensis.exe')), normalize(resolve(script)) ];
    if(process.platform != 'win32') {
        args.unshift('wine');
    }

    const child = spawn(args.shift(), args);

    await new Promise((resolve, reject) => {

        child.on('error', reject);
        child.on('close', (code, signal) => resolve({ code, signal }));

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);

    });

}
