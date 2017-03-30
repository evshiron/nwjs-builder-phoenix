
import { test } from 'ava';

import { Builder } from '../';
import { spawnAsync } from '../dist/lib/util';

const dir = './assets/project/';

test('commandline', async (t) => {

    const mirror = process.env.CI ? '' : '--mirror https://npm.taobao.org/mirrors/nwjs/';

    const { code, signal } = await spawnAsync('node', `./dist/bin/build.js --mac --x64 ${ mirror } --config ${ dir }/package.json ${ dir }`.split(' '), {
        stdio: 'inherit',
    });
    t.is(code, 0);

});

test('module', async (t) => {

    const mirror = process.env.CI ? undefined : 'https://npm.taobao.org/mirrors/nwjs/';

    const builder = new Builder({
        win: true,
        x64: true,
        mirror,
    }, dir);

    await builder.build();

});
