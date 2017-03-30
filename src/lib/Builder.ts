
import { dirname, basename, join, resolve } from 'path';

import { ensureDirAsync, emptyDir, readFileAsync, readJsonAsync, writeFileAsync, copyAsync, removeAsync, createReadStream, createWriteStream, renameAsync } from 'fs-extra-promise';

const debug = require('debug')('build:builder');
const globby = require('globby');
const rcedit = require('rcedit');
const plist = require('plist');

import { Downloader } from './Downloader';
import { FFmpegDownloader } from './FFmpegDownloader';
import { extractGeneric, compress } from './archive';
import { BuildConfig } from './BuildConfig';
import { NsisComposer, nsisBuild } from './nsis-gen';
import { mergeOptions, findExecutable, findFFmpeg, findRuntimeRoot, findExcludableDependencies, tmpName, tmpFile, tmpDir, cpAsync } from './util';

interface IBuilderOptions {
    win?: boolean;
    mac?: boolean;
    linux?: boolean;
    x86?: boolean;
    x64?: boolean;
    mirror?: string;
    config?: string;
    mute?: boolean;
}

export class Builder {

    public static DEFAULT_OPTIONS: IBuilderOptions = {
        win: false,
        mac: false,
        linux: false,
        x86: false,
        x64: false,
        mirror: Downloader.DEFAULT_OPTIONS.mirror,
        config: undefined,
        mute: true,
    };

    public options: IBuilderOptions;

    constructor(options: IBuilderOptions = {}, public dir: string) {

        this.options = mergeOptions(Builder.DEFAULT_OPTIONS, options);

        debug('in constructor', 'dir', dir);
        debug('in constructor', 'options', this.options);

    }

    public async build() {

        const tasks: string[][] = [];

        [ 'win', 'mac', 'linux' ].map((platform) => {
            [ 'x86', 'x64' ].map((arch) => {
                if((<any>this.options)[platform] && (<any>this.options)[arch]) {
                    tasks.push([ platform, arch ]);
                }
            });
        });

        if(!this.options.mute) {
            console.info('Starting building tasks...', {
                tasks,
            });
        }

        if(tasks.length == 0) {
            throw new Error('ERROR_NO_TASK');
        }

        const configPath = this.options.config ? this.options.config : join(this.dir, 'package.json');

        const pkg: any = await readJsonAsync(configPath);
        const config = new BuildConfig(pkg);

        debug('in build', 'configPath', configPath);
        debug('in build', 'config', config);

        for(const [ platform, arch ] of tasks) {

            await this.buildTask(platform, arch, pkg, config);

        }

    }

    protected combineExecutable(executable: string, nwFile: string) {
        return new Promise((resolve, reject) => {

            const nwStream = createReadStream(nwFile);
            const stream = createWriteStream(executable, {
                flags: 'a',
            });

            nwStream.on('error', reject);
            stream.on('error', reject);

            stream.on('finish', resolve);

            nwStream.pipe(stream);

        });
    }

    protected readPlist(path: string): Promise<any> {
        return readFileAsync(path, {
                encoding: 'utf-8',
        })
        .then(data => plist.parse(data));
    }

    protected writePlist(path: string, p: any) {
        return writeFileAsync(path, plist.build(p));
    }

    protected updateWinResources(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {
        return new Promise((resolve, reject) => {

            const path = join(targetDir, './nw.exe');

            const rc = {
                'product-version': config.win.productVersion,
                'file-version': config.win.fileVersion,
                'version-string': config.win.versionStrings,
                'icon': config.win.icon,
            };

            rcedit(path, rc, (err: Error) => err ? reject(err) : resolve());

        });
    }

    protected renameWinApp(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        const src = join(targetDir, 'nw.exe');
        const dest = join(targetDir, `${ config.win.versionStrings.ProductName }.exe`);

        return renameAsync(src, dest);

    }

    protected async updatePlist(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        const path = join(targetDir, './nwjs.app/Contents/Info.plist');

        const plist = await this.readPlist(path);

        plist.CFBundleIdentifier = config.appId;
        plist.CFBundleName = config.mac.name;
        plist.CFBundleDisplayName = config.mac.displayName;
        plist.CFBundleVersion = config.mac.version;
        plist.CFBundleShortVersionString = config.mac.version;

        await this.writePlist(path, plist);

    }

    protected async updateMacIcon(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        const path = join(targetDir, './nwjs.app/Contents/Resources/app.icns');

        if(!config.mac.icon) {
            return;
        }

        await copyAsync(config.mac.icon, path);

    }

    protected async fixMacMeta(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        const files = await globby([ '**/InfoPlist.strings' ], {
            cwd: targetDir,
        });

        for(const file of files) {

            const path = join(targetDir, file);

            const strings = <string>(await readFileAsync(path, {
                encoding: 'ucs2',
            }));

            const newStrings = strings.replace(/([A-Za-z]+)\s+=\s+"(.+?)";/g, (match: string, key: string, value: string) => {
                switch(key) {
                case 'CFBundleName':
                    return `${ key } = "${ config.mac.name }";`;
                case 'CFBundleDisplayName':
                    return `${ key } = "${ config.mac.displayName }";`;
                case 'CFBundleGetInfoString':
                    return `${ key } = "${ config.mac.version }";`;
                case 'NSContactsUsageDescription':
                    return `${ key } = "${ config.mac.description }";`;
                case 'NSHumanReadableCopyright':
                    return `${ key } = "${ config.mac.copyright }";`;
                default:
                    return `${ key } = "${ value }";`;
                }
            });

            await writeFileAsync(path, Buffer.from(newStrings, 'ucs2'));

        }

    }

    protected renameMacApp(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

            const src = join(targetDir, 'nwjs.app');
            const dest = join(targetDir, `${ config.mac.displayName }.app`);

            return renameAsync(src, dest);

    }

    protected renameLinuxApp(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        const src = join(targetDir, 'nw');
        const dest = join(targetDir, `${ pkg.name }`);

        return renameAsync(src, dest);

    }

    protected async prepareWinBuild(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        await this.updateWinResources(targetDir, appRoot, pkg, config);

    }

    protected async prepareMacBuild(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        await this.updatePlist(targetDir, appRoot, pkg, config);
        await this.updateMacIcon(targetDir, appRoot, pkg, config);
        await this.fixMacMeta(targetDir, appRoot, pkg, config);

    }

    protected async prepareLinuxBuild(targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

    }

    protected async copyFiles(platform: string, targetDir: string, appRoot: string, pkg: any, config: BuildConfig) {

        const generalExcludes = [
            '**/node_modules/.bin',
            '**/node_modules/*/{ example, examples, test, tests }',
            '**/{ .DS_Store, .git, .hg, .svn, *.log }',
        ];

        const dependenciesExcludes = await findExcludableDependencies(this.dir, pkg)
        .then((excludable) => {
            return excludable.map(excludable => [ excludable, `${ excludable }/**/*` ]);
        })
        .then((excludes) => {
            return Array.prototype.concat.apply([], excludes);
        });

        debug('in copyFiles', 'dependenciesExcludes', dependenciesExcludes);

        const ignore = [
            ...config.excludes,
            ...generalExcludes,
            ...dependenciesExcludes,
            ...[ config.output, `${ config.output }/**/*` ]
        ];

        debug('in copyFiles', 'ignore', ignore);

        const files = await globby(config.files, {
            cwd: this.dir,
            mark: true,
            ignore,
        });

        debug('in copyFiles', 'config.files', config.files);
        debug('in copyFiles', 'files', files);

        if(config.packed) {

            switch(platform) {
            case 'win32':
            case 'win':
            case 'linux':
                const nwFile = await tmpName();
                await compress(this.dir, files, 'zip', nwFile);
                const executable = await findExecutable(platform, targetDir);
                await this.combineExecutable(executable, nwFile);
                await removeAsync(nwFile);
                break;
            case 'darwin':
            case 'osx':
            case 'mac':
                for(const file of files) {
                    await cpAsync(join(this.dir, file), join(appRoot, file));
                }
                break;
            default:
                throw new Error('ERROR_UNKNOWN_PLATFORM');
            }

        }
        else {

            for(const file of files) {
                await cpAsync(join(this.dir, file), join(appRoot, file));
            }

        }

    }

    protected async integrateFFmpeg(platform: string, arch: string, targetDir: string, pkg: any, config: BuildConfig) {

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

        const ffmpegDir = await downloader.fetchAndExtract();

        const src = await findFFmpeg(platform, ffmpegDir);
        const dest = await findFFmpeg(platform, targetDir);

        await copyAsync(src, dest);

    }

    protected async buildDirTarget(platform: string, arch: string, runtimeDir: string, pkg: any, config: BuildConfig): Promise<string> {

        const targetDir = join(this.dir, config.output, `${ pkg.name }-${ pkg.version }-${ platform }-${ arch }`);
        const runtimeRoot = await findRuntimeRoot(platform, runtimeDir);
        const appRoot = join(targetDir, (() => {
            switch(platform) {
            case 'win32':
            case 'win':
            case 'linux':
                return './';
            case 'darwin':
            case 'osx':
            case 'mac':
                return './nwjs.app/Contents/Resources/app.nw/';
            default:
                throw new Error('ERROR_UNKNOWN_PLATFORM');
            }
        })());

        await new Promise((resolve, reject) => {
            emptyDir(targetDir, err => err ? reject(err) : resolve());
        });

        await copyAsync(runtimeRoot, targetDir);

        if(config.ffmpegIntegration) {
            await this.integrateFFmpeg(platform, arch, targetDir, pkg, config);
        }

        await ensureDirAsync(appRoot);

        // Copy before refining might void the effort.

        switch(platform) {
        case 'win32':
        case 'win':
            await this.prepareWinBuild(targetDir, appRoot, pkg, config);
            await this.copyFiles(platform, targetDir, appRoot, pkg, config);
            await this.renameWinApp(targetDir, appRoot, pkg, config);
            break;
        case 'darwin':
        case 'osx':
        case 'mac':
            await this.prepareMacBuild(targetDir, appRoot, pkg, config);
            await this.copyFiles(platform, targetDir, appRoot, pkg, config);
            await this.renameMacApp(targetDir, appRoot, pkg, config);
            break;
        case 'linux':
            await this.prepareLinuxBuild(targetDir, appRoot, pkg, config);
            await this.copyFiles(platform, targetDir, appRoot, pkg, config);
            await this.renameLinuxApp(targetDir, appRoot, pkg, config);
            break;
        default:
            throw new Error('ERROR_UNKNOWN_PLATFORM');
        }

        return targetDir;

    }

    protected async buildArchiveTarget(type: string, targetDir: string) {

        const targetZip = join(dirname(targetDir), `${ basename(targetDir) }.${ type }`);

        await removeAsync(targetZip);

        const files = await globby([ '**/*' ], {
            cwd: targetDir,
        });

        await compress(targetDir, files, type, targetZip);

        return targetZip;

    }

    protected async buildNsisTarget(platform: string, arch: string, targetDir: string, pkg: any, config: BuildConfig) {

        if(platform != 'win') {
            console.info(`Skip building nsis target for ${ platform }.`);
            return;
        }

        const targetNsis = resolve(dirname(targetDir), `${ basename(targetDir) }-Setup.exe`);

        const data = await (new NsisComposer({

            // Basic.
            appName: config.win.versionStrings.ProductName,
            companyName: config.win.versionStrings.CompanyName,
            description: config.win.versionStrings.FileDescription,
            version: config.win.productVersion,
            copyright: config.win.versionStrings.LegalCopyright,

            // Compression.
            compression: 'lzma',
            solid: true,

            // Files.
            srcDir: targetDir,

            // Output.
            output: targetNsis,

        })).make();

        const script = await tmpName();
        await writeFileAsync(script, data);

        await nsisBuild(script, {
            mute: false,
        });

        await removeAsync(script);

    }

    protected async buildTask(platform: string, arch: string, pkg: any, config: BuildConfig) {

        const downloader = new Downloader({
            platform, arch,
            version: config.nwVersion,
            flavor: config.nwFlavor,
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

        const runtimeDir = await downloader.fetchAndExtract();

        if(!this.options.mute) {
            console.info('Building directory target...');
        }

        const targetDir = await this.buildDirTarget(platform, arch, runtimeDir, pkg, config);

        for(const target of config.targets) {
            switch(target) {
            case 'zip':
            case '7z':
                if(!this.options.mute) {
                    console.info(`Building ${ target } archive target...`);
                }
                await this.buildArchiveTarget(target, targetDir);
                break;
            case 'nsis':
                if(!this.options.mute) {
                    console.info(`Building nsis target...`);
                }
                await this.buildNsisTarget(platform, arch, targetDir, pkg, config);
                break;
            default:
                throw new Error('ERROR_UNKNOWN_TARGET');
            }
        }

        if(!this.options.mute) {
            console.info(`Building for ${ platform }, ${ arch } ends.`);
        }

    }

}
