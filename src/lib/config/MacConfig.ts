import * as appdmg from 'appdmg';
import {SignableConfig} from './SignableConfig';

export class MacConfig extends SignableConfig {

    public name: string = '';
    public displayName: string = '';
    public version: string = '';
    public description: string = '';
    public copyright: string = '';
    public icon: string = undefined;
    public plistStrings: any = {};
    public appdmg: appdmg.Options | object = {};

    constructor(options: any = {}) {
        super(options);

        // default filesToSign for Mac
        this.signing.filesToSignGlobs = [
            '**/*',
        ];

        Object.keys(this).map((key) => {
            if (options[key] !== undefined) {
                switch (key) {
                    case 'appdmg':
                        this.appdmg = options.appdmg as appdmg.Options;
                        break;
                    default:
                        (<any>this)[key] = options[key];
                        break;
                }
            }
        });
    }

}
