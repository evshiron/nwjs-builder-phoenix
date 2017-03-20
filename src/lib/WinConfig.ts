
export class WinConfig {

    public productVersion: string = '';
    public fileVersion: string = '';
    public versionStrings: {
        ProductName?: undefined,
        FileDescription?: undefined,
        LegalCopyright?: undefined,
    } = {};
    public icon: string = undefined;

    constructor(options: any = {}) {

        Object.keys(this).map((key) => {
            if(options[key] !== undefined) {
                switch(key) {
                default:
                    (<any>this)[key] = options[key];
                    break;
                }
            }
        });

    }

}
