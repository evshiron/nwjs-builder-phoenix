
export class NsisConfig {

    public modern: boolean = true;
    public languages: string[] = [ 'English' ];

    public diffUpdaters: boolean = false;
    public hashCalculation: boolean = true;

    public customInstallerScript: string = undefined;
    public customUpdaterScript: string = undefined;

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
