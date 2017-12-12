import {SignableConfig} from './SignableConfig';

export class MacConfig extends SignableConfig {

    public name: string = '';
    public displayName: string = '';
    public version: string = '';
    public description: string = '';
    public copyright: string = '';
    public icon: string = undefined;
    public plistStrings: any = {};

    constructor(options: any = {}) {
        super(options);

        // default filesToSign for Mac
        this.signing.filesToSignGlobs = [
            '*/*/Contents/MacOS/nwjs',
            '*/*/Contents/Versions/*/nwjs Framework.framework/*/',
            '*/*/Contents/Versions/*/nwjs Framework.framework',
            '*/*/Contents/Versions/*/nwjs Helper.app',
        ];

        Object.keys(this).map((key) => {
            if (options[key] !== undefined) {
                switch (key) {
                    default:
                        (<any>this)[key] = options[key];
                        break;
                }
            }
        });
    }

}
