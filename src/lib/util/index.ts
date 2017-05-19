
import { join, dirname, relative } from 'path';
import { spawn, exec } from 'child_process';

import * as tmp from 'tmp';
tmp.setGracefulCleanup();
import { realpath, lstat, ensureDir, readFile, outputFile } from 'fs-extra';

const debug = require('debug')('build:util');
const globby = require('globby');

export * from './archive';

export function mergeOptions(defaults: any, options: any) {

    const opts: any = {};

    Object.keys(defaults).map((key) => {
        opts[key] = defaults[key];
    });

    Object.keys(defaults).map((key) => {
        opts[key] = options[key] === undefined ? opts[key] : options[key];
    });

    return opts;

}

export function findExecutable(platform: string, runtimeDir: string): Promise<string> {
    return new Promise((resolve, reject) => {

        const pattern = (() => {
            switch(platform) {
            case 'win32':
            case 'win':
                return '**/nw.exe';
            case 'darwin':
            case 'osx':
            case 'mac':
                return '**/nwjs.app/Contents/MacOS/nwjs';
            case 'linux':
                return '**/nw';
            default:
                throw new Error('ERROR_UNKNOWN_PLATFORM');
            }
        })();

        // FIXME: globby.d.ts.
        globby([ pattern ], {
            cwd: runtimeDir,
        })
        .then((matches: string[]) => {

            if(matches.length == 0) {
                const err = new Error('ERROR_EMPTY_MATCHES');
                return reject(err);
            }

            debug('in findExecutable', 'matches', matches);

            resolve(join(runtimeDir, matches[0]));

        });

    });
}

export function findFFmpeg(platform: string, dir: string): Promise<string> {
    return new Promise((resolve, reject) => {

        const pattern = (() => {
            switch(platform) {
            case 'win32':
            case 'win':
                return '**/ffmpeg.dll';
            case 'darwin':
            case 'osx':
            case 'mac':
                return '**/libffmpeg.dylib';
            case 'linux':
                return '**/libffmpeg.so';
            default:
                throw new Error('ERROR_UNKNOWN_PLATFORM');
            }
        })();

        // FIXME: globby.d.ts.
        globby([ pattern ], {
            cwd: dir,
        })
        .then((matches: string[]) => {

            if(matches.length == 0) {
                const err = new Error('ERROR_EMPTY_MATCHES');
                return reject(err);
            }

            debug('in findFFmpeg', 'matches', matches);

            resolve(join(dir, matches[0]));

        });

    });
}

export function findRuntimeRoot(platform: string, runtimeDir: string): Promise<string> {
    return new Promise((resolve, reject) => {

        const pattern = (() => {
            switch(platform) {
            case 'win32':
            case 'win':
                return '**/nw.exe';
            case 'darwin':
            case 'osx':
            case 'mac':
                return '**/nwjs.app';
            case 'linux':
                return '**/nw';
            default:
                throw new Error('ERROR_UNKNOWN_PLATFORM');
            }
        })();

        // FIXME: globby.d.ts.
        globby([ pattern ], {
            cwd: runtimeDir,
        })
        .then((matches: string[]) => {

            if(matches.length == 0) {
                const err = new Error('ERROR_EMPTY_MATCHES');
                return reject(err);
            }

            debug('in findExecutable', 'matches', matches);

            resolve(join(runtimeDir, dirname(matches[0])));

        });

    });
}

export async function findExcludableDependencies(dir: string, pkg: any) {

    const prod = await execAsync('npm ls --prod --parseable', {
        cwd: dir,
    })
    .then(({
        stdout, stderr,
    }) => {
        return stdout.split(/\r?\n/)
        .filter(path => path)
        .map((path) => {
            return relative(dir, path);
        });
    });

    debug('in findExcludableDependencies', 'prod', prod);

    const dev = await execAsync('npm ls --dev --parseable', {
        cwd: dir,
    })
    .then(({
        stdout, stderr,
    }) => {
        return stdout.split(/\r?\n/)
        .filter(path => path)
        .map((path) => {
            return relative(dir, path);
        });
    });

    debug('in findExcludableDependencies', 'dev', dev);

    const excludable = [];
    for(const d of dev) {
        if(prod.indexOf(d) == -1) {
            excludable.push(d);
        }
    }

    debug('in findExcludableDependencies', 'excludable', excludable);

    return excludable;

}

export function tmpName(options: any = {}): Promise<string> {
    return new Promise((resolve, reject) => {
        tmp.tmpName(Object.assign({}, {
        }, options), (err, path) => err ? reject(err) : resolve(path));
    });
}

export function tmpFile(options: any = {}): Promise<{
    path: string,
    fd: number,
    cleanup: () => void,
}> {
    return new Promise((resolve, reject) => {
        tmp.file(Object.assign({}, {
            //discardDescriptor: true,
        }, options), (err, path, fd, cleanup) => err ? reject(err) : resolve({
            path, fd, cleanup,
        }));
    });
}

export function tmpDir(options: any = {}): Promise<{
    path: string,
    cleanup: () => void,
}> {
    return new Promise((resolve, reject) => {
        tmp.dir(Object.assign({}, {
            unsafeCleanup: true,
        }, options), (err, path, cleanup) => err ? reject(err) : resolve({
            path, cleanup,
        }));
    });
}

export function fixWindowsVersion(version: string, build: number = 0) {
    return /^\d+\.\d+\.\d+$/.test(version)
    ? `${ version }.${ build }`
    : version;
}

export async function copyFileAsync(src: string, dest: string) {

    const rsrc = await realpath(src);

    const stats = await lstat(rsrc);

    if(stats.isDirectory()) {
        //await ensureDirAsync(dest);
    }
    else {
        await outputFile(dest, await readFile(rsrc));
    }

}

export function spawnAsync(executable: string, args: string[], options: any = {}): Promise<{
    code: number,
    signal: string,
}> {
    return new Promise((resolve, reject) => {

        debug('in spawnAsync', 'executable', executable);
        debug('in spawnAsync', 'args', args);
        debug('in spawnAsync', 'options', options);

        const child = spawn(executable, args, options);

        if(child.stdout) {
            child.stdout.on('data', chunk => debug('in spawnAsync', 'stdout', chunk.toString()));
        }

        if(child.stderr) {
            child.stderr.on('data', chunk => debug('in spawnAsync', 'stderr', chunk.toString()));
        }

        child.on('close', (code, signal) => {
            if(!options.detached) {
                resolve({
                    code, signal,
                });
            }
        });

        if(options.detached) {

            child.unref();

            resolve({
                code: 0,
                signal: '',
            });

        }

    });
}

export function execAsync(command: string, options: any = {}): Promise<{
    stdout: string,
    stderr: string,
}> {
    return new Promise((resolve, reject) => {

        debug('in execAsync', 'command', command);
        debug('in execAsync', 'options', options);

        const child = exec(command, options, (err, stdout, stderr) => {
            if(!options.detached) {
                resolve({
                    stdout, stderr,
                });
            }
        });

        if(options.detached) {

            child.unref();

            resolve({
                stdout: null,
                stderr: null,
            });

        }

    });
}
