
export class Event<TArgs> {

    public listeners: Array<(args: TArgs) => void> = [];

    constructor(name: string) {

    }

    public subscribe(fn: ((args: TArgs) => void)) {
        this.listeners.push(fn);
    }

    public trigger = (args: TArgs) => {
        this.listeners.map(fn => fn(args));
    }

    public unsubscribe(fn: ((args: TArgs) => void)) {
        this.listeners = this.listeners.filter(f => f != fn);
    }

}
