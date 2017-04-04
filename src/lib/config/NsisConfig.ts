
export class NsisConfig {

    public languages: string[] = [ 'English' ];

    public diffUpdaters: boolean = false;
    public hashCalculation: boolean = true;

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
