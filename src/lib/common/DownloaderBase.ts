
import { dirname, basename, resolve } from 'path';

import * as request from 'request';
import * as ProgressBar from 'progress';
import { ensureDirSync, exists, lstat, writeFile } from 'fs-extra';

const debug = require('debug')('build:downloader');
const progress = require('request-progress');

import { Event } from './Event';
import { mergeOptions, extractGeneric } from '../util';

const DIR_CACHES = resolve(dirname(module.filename), '..', '..', '..', 'caches');
ensureDirSync(DIR_CACHES);

export interface IRequestProgress {
    percent: number;
    speed: number;
    size: {
        total: number,
        transferred: number,
    };
    time: {
        elapsed: number,
        remaining: number,
    };
}

export abstract class DownloaderBase {

    public onProgress: Event<IRequestProgress> = new Event('progress');

    public static readonly DEFAULT_DESTINATION: string = DIR_CACHES;

    protected destination: string = DownloaderBase.DEFAULT_DESTINATION;

    public abstract async fetch(): Promise<string>;

    protected abstract handleVersion(version: string): Promise<string>;

    public async fetchAndExtract() {

        const archive = await this.fetch();
        const dest = `${ archive }-extracted`;

        await extractGeneric(archive, dest);

        return dest;

    }

    protected getVersions(): Promise<any> {
        return new Promise((resolve, reject) => {
            request('https://nwjs.io/versions.json', (err, res, body) => {

                if(err) {
                    return reject(err);
                }

                const json = JSON.parse(body);
                resolve(json);

            });
        });
    }

    protected setDestination(destination: string) {
        this.destination = destination;
    }

    protected handlePlatform(platform: string) {

        switch(platform) {
        case 'win32':
        case 'win':
            return 'win';
        case 'darwin':
        case 'osx':
        case 'mac':
            return 'osx';
        case 'linux':
            return 'linux';
        default:
            throw new Error('ERROR_UNKNOWN_PLATFORM');
        }

    }

    protected handleArch(arch: string) {

        switch(arch) {
        case 'x86':
        case 'ia32':
            return 'ia32';
        case 'x64':
            return 'x64';
        default:
            throw new Error('ERROR_UNKNOWN_PLATFORM');
        }

    }

    protected getLocalSize(path: string): Promise<number> {
        return lstat(path)
        .then(stat => stat.size);
    }

    protected getRemoteSize(url: string): Promise<number> {
        return new Promise((resolve, reject) => {
            request.head(url, {
                followAllRedirects: true,
            })
            .on('error', reject)
            .on('response', res => resolve(parseInt(<string>(res.headers['content-length']), 10)));
        });
    }

    protected isFileExists(path: string) {
        return new Promise((resolve, reject) => {
            exists(path, resolve);
        });
    }

    protected async isFileSynced(url: string, path: string) {

        const localSize = await this.getLocalSize(path);
        const remoteSize = await this.getRemoteSize(url);

        debug('in isFileSynced', 'localSize', localSize);
        debug('in isFileSynced', 'remoteSize', remoteSize);

        return localSize == remoteSize;

    }

    protected async download(url: string, filename: string, path: string, showProgress: boolean) {

        let bar: ProgressBar = null;

        const onProgress = (state: IRequestProgress) => {

            if(!state.size.total) {
                return;
            }

            if(!bar) {
                bar = new ProgressBar('[:bar] :speedKB/s :etas', {
                    width: 50,
                    total: state.size.total,
                });
                console.info('');
            }

            bar.update(state.size.transferred / state.size.total, {
                speed: (state.speed / 1000).toFixed(2),
            });

        };

        if(showProgress) {
            this.onProgress.subscribe(onProgress);
        }

        debug('in download', 'start downloading', filename);

        await new Promise((resolve, reject) => {
            progress(request(url, {
                encoding: null,
            }, (err, res, data) => {

                if(err) {
                    return reject(err);
                }

                if(res.statusCode != 200) {
                    const e = new Error(`ERROR_STATUS_CODE statusCode = ${ res.statusCode }`);
                    return reject(e);
                }

                writeFile(path, data, err => err ? reject(err) : resolve());

            }))
            .on('progress', (state: IRequestProgress) => {
                this.onProgress.trigger(state);
            });
        });

        debug('in fetch', 'end downloading', filename);

        if(showProgress) {
            this.onProgress.unsubscribe(onProgress);
            if(bar) {
                console.info('');
                bar.terminate();
            }
        }

        return path;

    }

}
