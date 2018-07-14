
export class SignableConfig {

    public signing: {
        cliArgs: string,
        cliArgsInterpolated?: string[],
        cliArgsVarsFile?: string,
        filesToSignGlobs: [string],
        signtoolPath: string,
    } = {
        cliArgs: '',
        cliArgsInterpolated: [''],
        cliArgsVarsFile: '.env',
        filesToSignGlobs: [''],
        signtoolPath: '',
    };

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
