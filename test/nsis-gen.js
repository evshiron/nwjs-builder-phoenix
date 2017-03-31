
import { test } from 'ava';

import { writeFileAsync, removeAsync } from 'fs-extra-promise';

import { NsisComposer, NsisDiffer, nsisBuild } from '../dist/lib/nsis-gen';
import { tmpName, tmpFile, tmpDir } from '../dist/lib/util';

const options = {

    // Basic.
    appName: 'Project',
    companyName: 'evshiron',
    description: 'description',
    version: '0.1.0.0',
    copyright: 'copyright',

    // Compression.
    compression: 'lzma',
    solid: true,

};

test.skip('build', async (t) => {

    const output = await tmpName();

    const data = await (new NsisComposer(Object.assign({}, options, {
        srcDir: './src/',
        output,
    })))
    .make();

    const script = await tmpName();

    await writeFileAsync(script, data);
    await nsisBuild(script);

    await removeAsync(output);
    await removeAsync(script);

});

test('diff', async (t) => {

    const output = await tmpName();

    const data = await (new NsisDiffer('./src/', './dist/', Object.assign({}, options, {
        output,
    })))
    .make();

    const script = await tmpName();

    await writeFileAsync(script, data);
    await nsisBuild(script);

    await removeAsync(output);
    await removeAsync(script);

});
