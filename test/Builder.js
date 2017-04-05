
import { test } from 'ava';

import { Builder } from '../';
import { spawnAsync } from '../dist/lib/util';

const dir = './assets/project/';

test('commandline --concurrent', async (t) => {

    const mirror = process.env.CI ? '' : '--mirror https://npm.taobao.org/mirrors/nwjs/';

    const { code, signal } = await spawnAsync('node', `./dist/bin/build.js --win --mac --linux --x64 --concurrent ${ mirror } ${ dir }`.split(' '), {
        stdio: 'inherit',
    });
    t.is(code, 0);

});

test.skip('module', async (t) => {

    const mirror = process.env.CI ? undefined : 'https://npm.taobao.org/mirrors/nwjs/';

    const builder = new Builder({
        win: true,
        x64: true,
        mirror,
    }, dir);

    await builder.build();

});
