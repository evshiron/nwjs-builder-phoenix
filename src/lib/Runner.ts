
import { resolve } from 'path';
import { spawn } from 'child_process';

import { copy, readJson, chmod } from 'fs-extra';

const debug = require('debug')('build:runner');

import { Downloader } from './Downloader';
import { FFmpegDownloader } from './FFmpegDownloader';
import { BuildConfig } from './config';
import { mergeOptions, findExecutable, findFFmpeg, tmpDir, spawnAsync, extractGeneric } from './util';
import { DownloaderBase } from './common';

export interface IRunnerOptions {
    x86?: boolean;
    x64?: boolean;
    chromeApp?: boolean;
    mirror?: string;
    detached?: boolean;
    mute?: boolean;
    forceCaches?: boolean;
    destination?: string;
}

export class Runner {

    public static DEFAULT_OPTIONS: IRunnerOptions = {
        x86: false,
        x64: false,
        chromeApp: false,
        mirror: Downloader.DEFAULT_OPTIONS.mirror,
        detached: false,
        mute: true,
        forceCaches: Downloader.DEFAULT_OPTIONS.forceCaches,
        destination: DownloaderBase.DEFAULT_DESTINATION,
    };

    public options: IRunnerOptions;

    constructor(options: IRunnerOptions = {}, public args: string[]) {

        this.options = mergeOptions(Runner.DEFAULT_OPTIONS, options);

        debug('in constructor', 'args', args);
        debug('in constructor', 'options', this.options);

    }

    public async run(): Promise<number> {

        const platform = process.platform;
        const arch = this.options.x86 || this.options.x64
        ? (this.options.x86 ? 'ia32' : 'x64')
        : process.arch;

        const pkg: any = await readJson(resolve(this.args[0], this.options.chromeApp ? 'manifest.json' : 'package.json'));
        const config = new BuildConfig(pkg);

        debug('in run', 'config', config);

        const downloader = new Downloader({
            platform, arch,
            version: config.nwVersion,
            flavor: 'sdk',
            mirror: this.options.mirror,
            useCaches: true,
            showProgress: this.options.mute ? false : true,
            forceCaches: this.options.forceCaches,
            destination: this.options.destination,
        });

        if(!this.options.mute) {
            console.info('Fetching NW.js binary...', {
                platform: downloader.options.platform,
                arch: downloader.options.arch,
                version: downloader.options.version,
                flavor: downloader.options.flavor,
            });
        }

        const runtimeDir = await downloader.fetchAndExtract();

        if(config.ffmpegIntegration) {

            // FIXME: Integrate without overwriting extracted files.
            //await this.integrateFFmpeg(platform, arch, runtimeDir, pkg, config);

            if(!this.options.mute) {
                console.warn('Running with FFmpeg integration is not supported.');
            }

        }

        const executable = await findExecutable(platform, runtimeDir);

        await chmod(executable, 0o555);

        if(!this.options.mute) {
            console.info('Launching NW.js app...');
        }

        const { code, signal } = await spawnAsync(executable, this.args, {
            detached: this.options.detached,
        });

        if(!this.options.mute) {
            if(this.options.detached) {

                console.info('NW.js app detached.');

                await new Promise((resolve, reject) => {
                    setTimeout(resolve, 3000);
                });

            }
            else {
                console.info(`NW.js app exited with ${ code }.`);
            }
        }

        return code;

    }

    protected async integrateFFmpeg(platform: string, arch: string, runtimeDir: string, pkg: any, config: BuildConfig) {

        const downloader = new FFmpegDownloader({
            platform, arch,
            version: config.nwVersion,
            useCaches: true,
            showProgress: this.options.mute ? false : true,
            forceCaches: this.options.forceCaches,
            destination: this.options.destination,
        });

        if(!this.options.mute) {
            console.info('Fetching FFmpeg prebuilt...', {
                platform: downloader.options.platform,
                arch: downloader.options.arch,
                version: downloader.options.version,
            });
        }

        const ffmpegDir = await downloader.fetchAndExtract();

        const src = await findFFmpeg(platform, ffmpegDir);
        const dest = await findFFmpeg(platform, runtimeDir);

        await copy(src, dest);

    }

}
