
import { join } from 'path';
import { spawn } from 'child_process';

import { copyAsync, readJsonAsync, chmodAsync } from 'fs-extra-promise';

const debug = require('debug')('build:runner');

import { Downloader } from './Downloader';
import { FFmpegDownloader } from './FFmpegDownloader';
import { BuildConfig } from './BuildConfig';
import { extract, extractTarGz } from './archive';
import { mergeOptions, findExecutable, findFFmpeg, tmpDir, spawnAsync } from './util';

interface IRunnerOptions {
    x86?: boolean;
    x64?: boolean;
    mirror?: string;
    detached?: boolean;
    config?: string;
    mute?: boolean;
}

export class Runner {

    public static DEFAULT_OPTIONS: IRunnerOptions = {
        x86: false,
        x64: false,
        mirror: Downloader.DEFAULT_OPTIONS.mirror,
        detached: false,
        config: undefined,
        mute: true,
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

        const configPath = this.options.config ? this.options.config : join(this.args[0], 'package.json');

        const pkg: any = await readJsonAsync(configPath);
        const config = new BuildConfig(pkg);

        debug('in run', 'configPath', configPath);
        debug('in run', 'config', config);

        const downloader = new Downloader({
            platform, arch,
            version: config.nwVersion,
            flavor: 'sdk',
            mirror: this.options.mirror,
            useCaches: true,
            showProgress: this.options.mute ? false : true,
        });

        if(!this.options.mute) {
            console.info('Fetching NW.js binary...', {
                platform: downloader.options.platform,
                arch: downloader.options.arch,
                version: downloader.options.version,
                flavor: downloader.options.flavor,
            });
        }

        const archivePath = await downloader.fetch();

        const { path: runtimeDir, cleanup } = await tmpDir();

        if(!this.options.mute) {
            console.info('Extracting NW.js binary...', {
                runtimeDir,
            });
        }

        if(archivePath.endsWith('.zip')) {
            await extract(archivePath, runtimeDir);
        }
        else if(archivePath.endsWith('tar.gz')) {
            await extractTarGz(archivePath, runtimeDir);
        }
        else {
            throw new Error('ERROR_UNKNOWN_EXTENSION');
        }

        if(config.ffmpegIntegration) {
            await this.integrateFFmpeg(platform, arch, runtimeDir, pkg, config);
        }

        const executable = await findExecutable(platform, runtimeDir);

        await chmodAsync(executable, 0o555);

        if(!this.options.mute) {
            console.info('Launching NW.js app...');
        }

        const { code, signal } = await spawnAsync(executable, this.args, {
            detached: this.options.detached,
        });

        cleanup();

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
        });

        if(!this.options.mute) {
            console.info('Fetching FFmpeg prebuilt...', {
                platform: downloader.options.platform,
                arch: downloader.options.arch,
                version: downloader.options.version,
            });
        }

        const path = await downloader.fetch();

        const { path: ffmpegDir, cleanup } = await tmpDir();

        if(!this.options.mute) {
            console.info('Extracting FFmpeg prebuilt...', {
                ffmpegDir,
            });
        }

        if(path.endsWith('.zip')) {
            await extract(path, ffmpegDir);
        }
        else {
            throw new Error('ERROR_UNKNOWN_EXTENSION');
        }

        const src = await findFFmpeg(platform, ffmpegDir);
        const dest = await findFFmpeg(platform, runtimeDir);

        await copyAsync(src, dest);

    }

}
