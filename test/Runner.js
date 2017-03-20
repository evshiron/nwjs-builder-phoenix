
import { test } from 'ava';

import { Runner } from '../';
import { spawnAsync } from '../dist/lib/util';

const dir = './assets/project/';

// FIXME: When run with other tests, the code will be 0.
test.serial('commandline --mirror', async (t) => {

    const mirror = process.env.CI ? '' : '--mirror https://npm.taobao.org/mirrors/nwjs/';

    const { code, signal } = await spawnAsync('node', `./dist/bin/run.js ${ mirror } ${ dir } 233`.split(' '), {
        stdio: 'inherit',
    });
    t.is(code, 233);

});

test.serial('commandline with environment variables', async (t) => {

    const { code, signal } = await spawnAsync('node', `./dist/bin/run.js ${ dir } 233`.split(' '), {
        stdio: 'inherit',
        env: Object.assign({}, process.env, {
            NWJS_MIRROR: process.env.CI ? '' : 'https://npm.taobao.org/mirrors/nwjs/',
        }),
    });
    t.is(code, 233);

});

test.serial('commandline --detached', async (t) => {

    const mirror = process.env.CI ? '' : '--mirror https://npm.taobao.org/mirrors/nwjs/';

    const { code, signal } = await spawnAsync('node', `./dist/bin/run.js ${ mirror } --detached ${ dir } 233`.split(' '), {
        stdio: 'inherit',
    });
    t.is(code, 0);

});

test.serial('module', async (t) => {

    const mirror = process.env.CI ? undefined : 'https://npm.taobao.org/mirrors/nwjs/';

    const runner = new Runner({
        mirror,
    }, [ dir, '233' ]);

    const code = await runner.run();
    t.is(code, 233);

});
