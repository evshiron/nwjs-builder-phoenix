
import { test } from 'ava';

import { remove } from 'fs-extra';

import { mergeOptions, tmpName, tmpFile, tmpDir, compress } from '../dist/lib/util';

test('mergeOptions', async (t) => {

    const defaults = {
        a: false,
        b: 123,
        c: '123',
    };

    const options = mergeOptions(defaults, {
        b: undefined,
        c: '456',
    });

    t.deepEqual(options, {
        a: false,
        b: 123,
        c: '456',
    });

});

test('compress', async (t) => {

    // Don't use `tmpFile`, which keeps the file open and results in exceptions when spawning.
    const path = await tmpName();

    const code = await compress('./assets/', [ './project/index.html', './project/package.json' ], 'zip', path);
    t.is(code, 0);

    await remove(path);

});
