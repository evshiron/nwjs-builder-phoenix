
import { normalize } from 'path';

import { WinConfig } from './WinConfig';
import { MacConfig } from './MacConfig';
import { LinuxConfig } from './LinuxConfig';
import { NsisConfig } from './NsisConfig';

export class BuildConfig {

    public nwVersion: string = 'lts';
    public nwFlavor: string = 'normal';

    public output: string = './dist/';
    public packed: boolean = false;
    public targets: string[] = [];
    public files: string[] = [ '**/*' ];
    public excludes: string[] = [];

    public win: WinConfig = new WinConfig();
    public mac: MacConfig = new MacConfig();
    public linux: LinuxConfig = new LinuxConfig();
    public nsis: NsisConfig = new NsisConfig();

    public appId: string = undefined;
    public ffmpegIntegration: boolean = false;
    public strippedProperties: string[] = [ 'scripts', 'devDependencies', 'build' ];

    constructor(pkg: any = {}) {

        const options = pkg.build ? pkg.build : {};

        Object.keys(this).map((key) => {
            if(options[key] !== undefined) {
                switch(key) {
                case 'win':
                    this.win = new WinConfig(options.win);
                    break;
                case 'mac':
                    this.mac = new MacConfig(options.mac);
                    break;
                case 'linux':
                    this.linux = new LinuxConfig(options.linux);
                    break;
                case 'nsis':
                    this.nsis = new NsisConfig(options.nsis);
                    break;
                default:
                    (<any>this)[key] = options[key];
                    break;
                }
            }
        });

        this.output = normalize(this.output);

        this.appId = `io.github.nwjs.${ pkg.name }`;

        this.win.versionStrings.ProductName = this.win.versionStrings.ProductName ? this.win.versionStrings.ProductName : pkg.name;
        this.win.versionStrings.FileDescription = this.win.versionStrings.FileDescription ? this.win.versionStrings.FileDescription : pkg.description;
        this.win.productVersion = this.win.productVersion ? this.win.productVersion : pkg.version;
        this.win.fileVersion = this.win.fileVersion ? this.win.fileVersion : this.win.productVersion;

        this.mac.name = this.mac.name ? this.mac.name : pkg.name;
        this.mac.displayName = this.mac.displayName ? this.mac.displayName : this.mac.name;
        this.mac.version = this.mac.version ? this.mac.version : pkg.version;
        this.mac.description = this.mac.description ? this.mac.description : pkg.description;

    }

}
