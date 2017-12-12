import {SignableConfig} from './SignableConfig';

export class WinConfig extends SignableConfig {

    public productName: string = '';
    public companyName: string = '';
    public fileDescription: string = '';
    public productVersion: string = '';
    public fileVersion: string = '';
    public copyright: string = '';
    public versionStrings: {
        ProductName?: undefined,
        CompanyName?: undefined,
        FileDescription?: undefined,
        LegalCopyright?: undefined,
    } = {};
    public icon: string = undefined;

    constructor(options: any = {}) {
        super(options);
        // default filesToSign for Windows
        this.signing.filesToSignGlobs = ['**/*.+(exe|dll)'];

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
