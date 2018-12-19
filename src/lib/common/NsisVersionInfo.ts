
import { basename, dirname, relative } from 'path';
import { createHash } from 'crypto';

import { exists, readJson, writeJson, createReadStream } from 'fs-extra';
import * as semver from 'semver';

export interface IInstaller {
    arch: string;
    path: string;
    hash: string;
    created: number;
}

export interface IUpdater {
    arch: string;
    fromVersion: string;
    path: string;
    hash: string;
    created: number;
}

export interface IVersion {
    version: string;
    changelog: string;
    source: string;
    installers: IInstaller[];
    updaters: IUpdater[];
}

export interface IVersionInfoData {
    latest: string;
    versions: IVersion[];
}

export class NsisVersionInfo {

    protected outputDir: string;
    protected data: IVersionInfoData;

    constructor(protected path: string) {

        this.outputDir = dirname(path);

    }

    public async addVersion(version: string, changelog: string, source: string) {

        const data = await this.getData();

        if(!data.versions.find(item => item.version == version)) {

            data.versions.push({
                version,
                changelog,
                source: basename(source),
                installers: [],
                updaters: [],
            });

        }

        this.updateLatestVersion();

    }

    public async getVersions(): Promise<string[]> {

        const data = await this.getData();

        return data.versions.map(item => item.version);

    }

    public async getVersion(version: string): Promise<IVersion> {

        const data = await this.getData();

        const item = data.versions.find(item => item.version == version);

        if(!item) {
            throw new Error('ERROR_VERSION_NOT_FOUND');
        }

        return item;

    }

    public async addInstaller(version: string, arch: string, path: string) {

        const data = await this.getData();

        const versionItem: IVersion = data.versions.find(item => item.version == version);

        if(!versionItem) {
            throw new Error('ERROR_VERSION_NOT_FOUND');
        }

        if(!versionItem.installers.find(item => item.arch == arch)) {

            versionItem.installers.push({
                arch,
                path: relative(this.outputDir, path),
                hash: await this.hashFile('sha256', path),
                created: Date.now(),
            });

        }

    }

    public async addUpdater(version: string, fromVersion: string, arch: string, path: string) {

        const data = await this.getData();

        const versionItem: IVersion = data.versions.find(item => item.version == version);

        if(!versionItem) {
            throw new Error('ERROR_VERSION_NOT_FOUND');
        }

        if(!versionItem.updaters.find(item => item.fromVersion == fromVersion && item.arch == arch)) {

            versionItem.updaters.push({
                fromVersion,
                arch,
                path: relative(this.outputDir, path),
                hash: await this.hashFile('sha256', path),
                created: Date.now(),
            });

        }

    }

    public async save() {
        await writeJson(this.path, this.data);
    }

    protected async getData() {

        if(!this.data) {
            this.data = (await new Promise((resolve, reject) => exists(this.path, resolve)))
            ? await readJson(this.path)
            : {
                latest: undefined,
                versions: [],
            };
        }

        return this.data;

    }

    protected updateLatestVersion() {

        if(this.data.versions.length == 0) {
            return;
        }

        const versions = [ ...this.data.versions ];
        versions.sort((a, b) => semver.gt(a.version, b.version) ? -1 : 1);

        this.data.latest = versions[0].version;

    }

    protected hashFile(type: string, path: string): Promise<string> {
        return new Promise((resolve, reject) => {

            const hasher = createHash(type);

            hasher.on('error', reject);
            hasher.on('readable', () => {

                const data = hasher.read();

                if(data) {
                    hasher.end();
                    resolve((<any>data).toString('hex'));
                }

            });

            createReadStream(path).pipe(hasher);

        });
    }

}
