
import { test } from 'ava';

import { removeAsync } from 'fs-extra-promise';

import { compress } from '../dist/lib/archive';
import { tmpName, tmpFile, tmpDir } from '../dist/lib/util';

(process.env.CI ? test.skip : test)('compress', async (t) => {

    // Don't use `tmpFile`, which keeps the file open and results in exceptions when spawning.
    const path = await tmpName();

    const code = await compress('./assets/', [ './project/index.html', './project/package.json' ], 'zip', path);
    t.is(code, 0);

    await removeAsync(path);

});
