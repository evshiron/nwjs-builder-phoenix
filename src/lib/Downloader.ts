
import { dirname, basename, join, resolve } from 'path';

import * as request from 'request';
import * as ProgressBar from 'progress';
import { ensureDirSync, exists, writeFile } from 'fs-extra-promise';

const debug = require('debug')('build:downloader');
const progress = require('request-progress');

import { Event } from './Event';
import { mergeOptions } from './util';

const DIR_CACHES = resolve(dirname(module.filename), '..', '..', 'caches');
ensureDirSync(DIR_CACHES);

interface IRequestProgress {
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

interface IDownloaderOptions {
    platform?: string;
    arch?: string;
    version?: string;
    flavor?: string;
    mirror?: string;
    useCaches?: boolean;
    showProgress?: boolean;
}

export class Downloader {

    public static DEFAULT_OPTIONS: IDownloaderOptions = {
        platform: process.platform,
        arch: process.arch,
        version: '0.14.7',
        flavor: 'normal',
        mirror: 'https://dl.nwjs.io/',
        useCaches: true,
        showProgress: true,
    };

    public onProgress: Event<IRequestProgress> = new Event('progress');

    public options: IDownloaderOptions;

    private destination: string = DIR_CACHES;

    constructor(options: IDownloaderOptions) {

        this.options = mergeOptions(Downloader.DEFAULT_OPTIONS, options);

        if(process.env.NWJS_MIRROR) {
            this.options.mirror = process.env.NWJS_MIRROR;
        }

        debug('in constructor', 'options', this.options);

    }

    public async fetch() {

        const { mirror, platform, arch, version, flavor, showProgress } = this.options;

        const partVersion = await this.handleVersion(version);
        const partFlavor = flavor == 'normal' ? '' : '-' + flavor;
        const partPlatform = this.handlePlatform(platform);
        const partArch = this.handleArch(arch);
        const partExtension = this.extensionByPlatform(platform);

        const url = `${ mirror }/${ partVersion }/nwjs${ partFlavor }-${ partVersion }-${ partPlatform }-${ partArch }.${ partExtension }`;
        const filename = basename(url);
        const path = join(this.destination, filename);

        debug('in fetch', 'url', url);
        debug('in fetch', 'filename', filename);
        debug('in fetch', 'path', path);

        if(!(await this.isFileExists(path))) {
            await this.download(url, filename, path, showProgress);
        }

        return path;

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

    protected async handleVersion(version: string) {
        switch(version) {
        case 'latest':
        case 'stable':
        case 'lts':
            const versions = await this.getVersions();
            //debug('in handleVersion', 'versions', versions);
            return versions[version];
        default:
            return version[0] == 'v' ? version : 'v' + version;
        }
    }

    protected extensionByPlatform(platform: string) {

        switch(platform) {
        case 'win32':
        case 'win':
            return 'zip';
        case 'darwin':
        case 'osx':
        case 'mac':
            return 'zip';
        case 'linux':
            return 'tar.gz';
        default:
            throw new Error('ERROR_UNKNOWN_PLATFORM');
        }

    }

    protected setDestination(destination: string) {
        this.destination = destination;
    }

    protected isFileExists(path: string) {
        return new Promise((resolve, reject) => {
            exists(path, resolve);
        });
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
