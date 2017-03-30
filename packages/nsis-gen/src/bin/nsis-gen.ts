
import { writeFileAsync } from 'fs-extra-promise';

import * as yargs from 'yargs';

import { NsisComposer, nsisBuild } from '../lib';

yargs.argv;

(async () => {

    const data = await (new NsisComposer({

        // Basic.
        appName: 'Project',
        companyName: 'evshiron',
        description: 'description',
        version: '0.1.0.0',
        copyright: 'copyright',

        // Compression.
        compression: 'lzma',
        solid: true,

        // Styles.
        xpStyle: true,

        // Files.
        srcDir: '../../assets/project/dist/project-0.1.0-win-x64/',

        // Output.
        output: '../../assets/project/dist/project-0.1.0-win-x64-Setup.exe',

    }))
    .make();

    const script = '../../assets/project/dist/project-0.1.0-win-x64.nsi';

    await writeFileAsync(script, data);
    await nsisBuild(script);

})()
.catch(console.error);
