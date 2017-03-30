
import { test } from 'ava';

import { writeFileAsync, removeAsync } from 'fs-extra-promise';

import { NsisComposer, nsisBuild } from '../dist/lib/nsis-gen';
import { tmpName, tmpFile, tmpDir } from '../dist/lib/util';

test('build', async (t) => {

    const output = await tmpName();

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
        srcDir: './src/',

        // Output.
        output,

    }))
    .make();

    const script = await tmpName();

    await writeFileAsync(script, data);
    await nsisBuild(script);

    await removeAsync(output);
    await removeAsync(script);

});
