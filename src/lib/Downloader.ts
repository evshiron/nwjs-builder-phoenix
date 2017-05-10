
import { dirname, basename, resolve } from 'path';

const debug = require('debug')('build:downloader');

import { DownloaderBase } from './common/DownloaderBase';
import { mergeOptions } from './util';

interface IDownloaderOptions {
    platform?: string;
    arch?: string;
    version?: string;
    flavor?: string;
    mirror?: string;
    useCaches?: boolean;
    showProgress?: boolean;
}

export class Downloader extends DownloaderBase {

    public static DEFAULT_OPTIONS: IDownloaderOptions = {
        platform: process.platform,
        arch: process.arch,
        version: '0.14.7',
        flavor: 'normal',
        mirror: 'https://dl.nwjs.io/',
        useCaches: true,
        showProgress: true,
    };

    public options: IDownloaderOptions;

    constructor(options: IDownloaderOptions) {
        super();

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
        const path = resolve(this.destination, filename);

        debug('in fetch', 'url', url);
        debug('in fetch', 'filename', filename);
        debug('in fetch', 'path', path);

        try {
            if(await this.isFileExists(path) && await this.isFileSynced(url, path)) {
                return path;
            }
        }
        catch(err) {
            if(err.code === 'ENOTFOUND' && this.options.useCaches) {
                return path;
            }
            else {
                throw err;
            }
        }

        await this.download(url, filename, path, showProgress);

        return path;

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

}
