
import { dirname, basename, join, resolve } from 'path';

import * as request from 'request';
import * as ProgressBar from 'progress';
import { ensureDirSync, exists, writeFile } from 'fs-extra-promise';

const debug = require('debug')('build:ffmpegDownloader');
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

interface IFFmpegDownloaderOptions {
    platform?: string;
    arch?: string;
    version?: string;
    mirror?: string;
    useCaches?: boolean;
    showProgress?: boolean;
}

export class FFmpegDownloader {

    public static DEFAULT_OPTIONS: IFFmpegDownloaderOptions = {
        platform: process.platform,
        arch: process.arch,
        version: '0.14.7',
        mirror: 'https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/',
        useCaches: true,
        showProgress: true,
    };

    public onProgress: Event<IRequestProgress> = new Event('progress');

    public options: IFFmpegDownloaderOptions;

    private destination: string = DIR_CACHES;

    constructor(options: IFFmpegDownloaderOptions) {

        this.options = mergeOptions(FFmpegDownloader.DEFAULT_OPTIONS, options);

        debug('in constructor', 'options', options);

    }

    public async fetch() {

        const { mirror, version, platform, arch, showProgress } = this.options;

        const partVersion = this.handleVersion(version);
        const partPlatform = this.handlePlatform(platform);
        const partArch = this.handleArch(arch);

        const url = `${ mirror }/${ partVersion }/${ partVersion }-${ partPlatform }-${ partArch }.zip`;

        const filename = `ffmpeg-${ basename(url) }`;
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

    protected handleVersion(version: string) {

        switch(version) {
        case 'lts':
        case 'stable':
        case 'latest':
            throw new Error('ERROR_VERSION_UNSUPPORTED');
        default:
            return version[0] == 'v' ? version.slice(1) : version;
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
                bar.terminate();
            }
        }

        return path;

    }

}
