
export class MacConfig {

    public name: string = '';
    public displayName: string = '';
    public version: string = '';
    public description: string = '';
    public copyright: string = '';
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
