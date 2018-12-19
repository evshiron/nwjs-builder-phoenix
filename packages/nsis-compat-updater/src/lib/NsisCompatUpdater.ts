
import { resolve as urlResolve } from 'url';
import { lstat, readFile, createReadStream, createWriteStream, Stats, ReadStream } from 'fs';
import { IncomingMessage } from 'http';
import { createHash } from 'crypto';
import { spawn } from 'child_process';

import * as semver from 'semver';
import * as tmp from 'tmp';

const debug = require('debug/src/browser')('nsis-compat-updater');
const got = require('got');
const progressStream = require('progress-stream');

import { Event } from './Event';

interface IInstaller {
    arch: string;
    path: string;
    hash: string;
    created: number;
}

interface IUpdater {
    arch: string;
    fromVersion: string;
    path: string;
    hash: string;
    created: number;
}

interface IVersion {
    version: string;
    changelog: string;
    source: string;
    installers: IInstaller[];
    updaters: IUpdater[];
}

interface IVersionInfo {
    latest: string;
    versions: IVersion[];
}

interface IStreamProgress {
    percentage: number;
    transferred: number;
    length: number;
    remaining: number;
    eta: number;
    runtime: number;
    delta: number;
    speed: number;
}

export class NsisCompatUpdater {

    public onDownloadProgress: Event<IStreamProgress> = new Event('downloadProgress');

    protected versionInfo: IVersionInfo;

    constructor(protected seed: string, protected currentVersion: string, protected currentArch: 'x86' | 'x64') {

    }

    public async checkForUpdates(): Promise<IVersion> {

        debug('in checkForUpdates');

        const versionInfo = await this.getVersionInfo();

        if(!semver.gt(versionInfo.latest, this.currentVersion)) {
            return null;
        }

        return await this.getVersion(versionInfo.latest);

    }

    public async downloadUpdate(version: string): Promise<string> {

        debug('in downloadUpdate', 'version', version);

        const { installers, updaters } = await this.getVersion(version);

        const { url, hash } = (() => {

            const updater = updaters.filter(updater => updater.fromVersion == this.currentVersion && updater.arch == this.currentArch)[0];

            if(updater) {
                return {
                    url: `${ urlResolve(urlResolve(this.seed, './'), updater.path) }`,
                    hash: updater.hash,
                };
            }

            const installer = installers.filter(installer => installer.arch == this.currentArch)[0];

            if(installer) {
                return {
                    url: `${ urlResolve(urlResolve(this.seed, './'), installer.path) }`,
                    hash: installer.hash,
                };
            }

            throw new Error('ERROR_UPDATER_NOT_FOUND');

        })();

        const path = await this.tmpUpdateFile();

        debug('in downloadUpdate', 'url', url);
        await this.download(url, path);

        debug('in downloadUpdate', 'path', path);
        if(!await this.checkFileHash('sha256', path, hash)) {
            throw new Error('ERROR_HASH_MISMATCH');
        }

        return path;

    }

    public install(path: string, slient: boolean = false) {

        debug('in install', 'path', path);
        debug(`in install`, 'slient', slient);

        const args = [];
        const options = {
            detached: true,
            stdio: 'ignore',
        };

        if(slient) {
            args.push('/S');
        }

        try {

            spawn(path, args, options)
            .unref();

        }
        catch(err) {

            if(err.code == 'UNKNOWN') {

                /*
                // TODO: Elevate and run again.

                spawn(elevate, [ path, ...args ], options)
                .unref();
                */

            }
            else {
                throw err;
            }

        }

    }

    public installWhenQuit(path: string) {

        console.info('installWhenQuit');

        if((<any>process.versions).nw) {
            throw new Error('ERROR_UNKNOWN');
        }
        else if((<any>process.versions).electron) {
            return require('electron').app.on('quit', () => this.install(path, true));
        }
        else {
            throw new Error('ERROR_UNKNOWN');
        }

    }

    public quitAndInstall(path: string) {

        console.info('quitAndInstall');

        if((<any>process.versions).nw) {
            this.install(path, false);
            nw.App.quit();
        }
        else if((<any>process.versions).electron) {
            return require('electron').app.quit();
        }
        else {
            throw new Error('ERROR_UNKNOWN');
        }

    }

    protected async getVersion(version: string): Promise<IVersion> {

        const versionInfo = await this.getVersionInfo();

        const item = versionInfo.versions.filter(item => item.version == version)[0];

        if(!item) {
            throw new Error('ERROR_VERSION_NOT_FOUND');
        }

        return item;

    }

    protected tmpUpdateFile(): Promise<string> {
        return new Promise((resolve, reject) => {
            tmp.file(<any>{
                postfix: '.exe',
                discardDescriptor: true,
            }, (err, path, fd, cleanup) => err ? reject(err) : resolve(path));
        });
    }

    protected checkFileHash(type: string, path: string, expected: string): Promise<boolean> {
        return new Promise((resolve, reject) => {

            const hasher = createHash(type);

            hasher.on('error', reject);
            hasher.on('readable', () => {

                const data = hasher.read();

                if(data) {
                    resolve((<any>data).toString('hex') == expected);
                }

            });

            createReadStream(path).pipe(hasher);

        });
    }

    protected async getVersionInfo(): Promise<IVersionInfo> {

        if(!this.versionInfo) {

            const versionInfo = await got(this.seed, {
                retries: 1,
                timeout: 5000,
            })
            .then((res: any) => JSON.parse(res.body));
            debug('in getVersionInfo', 'versionInfo', versionInfo);

            this.versionInfo = versionInfo;

        }

        return this.versionInfo;

    }

    protected async download(url: string, path: string, onProgress?: (state: IStreamProgress) => void) {

        const stream = got.stream(url);

        const size = await new Promise((resolve, reject) => {
            stream.on('error', reject);
            stream.on('response', resolve);
        })
        .then((res: IncomingMessage) => res.headers['content-length']);

        const progress = progressStream({
            length: size,
            time: 1000,
        });

        progress.on('progress', this.onDownloadProgress.trigger);

        await new Promise((resolve, reject) => {
            stream.pipe(progress)
            .pipe(createWriteStream(path))
            .on('finish', resolve);
        });

    }

}
