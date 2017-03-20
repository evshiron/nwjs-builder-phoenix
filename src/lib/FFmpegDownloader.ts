
import { dirname, basename, resolve } from 'path';

import * as request from 'request';
import * as ProgressBar from 'progress';
import { ensureDirSync, exists, writeFile } from 'fs-extra-promise';

const debug = require('debug')('build:ffmpegDownloader');
const progress = require('request-progress');

import { DownloaderBase } from './DownloaderBase';
import { Event } from './Event';
import { extractGeneric } from './archive';
import { mergeOptions } from './util';

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

export class FFmpegDownloader extends DownloaderBase {

    public static DEFAULT_OPTIONS: IFFmpegDownloaderOptions = {
        platform: process.platform,
        arch: process.arch,
        version: '0.14.7',
        mirror: 'https://github.com/iteufel/nwjs-ffmpeg-prebuilt/releases/download/',
        useCaches: true,
        showProgress: true,
    };

    public options: IFFmpegDownloaderOptions;

    constructor(options: IFFmpegDownloaderOptions) {
        super();

        this.options = mergeOptions(FFmpegDownloader.DEFAULT_OPTIONS, options);

        debug('in constructor', 'options', options);

    }

    public async fetch() {

        const { mirror, version, platform, arch, showProgress } = this.options;

        const partVersion = await this.handleVersion(version);
        const partPlatform = this.handlePlatform(platform);
        const partArch = this.handleArch(arch);

        const url = `${ mirror }/${ partVersion }/${ partVersion }-${ partPlatform }-${ partArch }.zip`;
        const filename = `ffmpeg-${ basename(url) }`;
        const path = resolve(this.destination, filename);

        debug('in fetch', 'url', url);
        debug('in fetch', 'filename', filename);
        debug('in fetch', 'path', path);

        if(await this.isFileExists(path) && await this.isFileSynced(url, path)) {
            return path;
        }

        await this.download(url, filename, path, showProgress);

        return path;

    }

    protected async handleVersion(version: string) {
        switch(version) {
        case 'lts':
        case 'stable':
        case 'latest':
            throw new Error('ERROR_VERSION_UNSUPPORTED');
        default:
            return version[0] == 'v' ? version.slice(1) : version;
        }
    }

}
