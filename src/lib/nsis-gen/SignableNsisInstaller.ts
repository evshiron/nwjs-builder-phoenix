import {dirname, resolve, win32} from 'path';

import {INsisComposerOptions, NsisComposer} from './NsisComposer';

export class SignableNsisInstaller extends NsisComposer {

    constructor(protected uninstallerOnly: boolean, public options: INsisComposerOptions) {
        super(options as INsisComposerOptions);
    }

    public getUninstallerPath() {
        const outpath = dirname(resolve(this.options.output));
        const uninstallerPath = win32.normalize(resolve(outpath, this.getUninstallerName()));
        return `${uninstallerPath}.exe`;
    }

    protected async makeModernUIUnInstallWizard(): Promise<string> {
        return this.uninstallerOnly
            ? await super.makeModernUIUnInstallWizard()
            : '; omitted since will have already been done in uninstallerOnly mode pass';
    }

    protected async makeHookOnInit(): Promise<string> {
        const uninstallHook = this.uninstallerOnly
            ? `
    WriteUninstaller "${ this.getUninstallerPath() }"
    !insertmacro quitSuccess
    `
            : '';
        return await super.makeHookOnInit() +  uninstallHook;
    }

    protected async makeInstallSection(): Promise<string> {
        const dummyInstallerSection = `
Section Install
  ; running to create uninstaller only; no commands needed
SectionEnd
        `;
        return this.uninstallerOnly ? await dummyInstallerSection : await super.makeInstallSection();
        // return await super.makeInstallSection();
    }

    protected async makeInstallSectionEnd(): Promise<string> {
        return '; omitting WriteUninstaller since uninstaller will be created not as a wizard step';
    }

    protected async makeUninstallSection(): Promise<string> {
        return this.uninstallerOnly
            ? await super.makeUninstallSection()
            : `; omitting uninstaller section since it was already created and packaged`;
    }

}
