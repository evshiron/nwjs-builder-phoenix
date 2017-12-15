import {Nsis7Zipper} from './Nsis7Zipper';
import {INsisComposerOptions} from './NsisComposer';
import {SignableNsisInstaller} from './SignableNsisInstaller';

export class SignableNsis7Zipper extends SignableNsisInstaller {

    constructor(protected path: string, protected uninstallerOnly: boolean, options: INsisComposerOptions) {
        super(uninstallerOnly, (options.solid = false, options));
    }

    protected async makeInstallerFiles(): Promise<string> {
        return await Nsis7Zipper.getMakeInstallerFiles(this.path);
    }

}
