
export class NsisConfig {

    public icon: string = undefined;
    public unIcon: string = undefined;

    public languages: string[] = [ 'English' ];

    public installDirectory: string = '$LOCALAPPDATA\\${_APPNAME}';

    public diffUpdaters: boolean = false;
    public hashCalculation: boolean = true;
    public requestExecutionLevel: string   = 'user';
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
