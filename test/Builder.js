
import { test } from 'ava';

import { Builder } from '../';
import { spawnAsync } from '../dist/lib/util';

const dir = './assets/project/';

test.serial('commandline', async (t) => {

    const platform = (() => {
        switch(process.platform) {
        case 'win32':
            return '--win';
        case 'darwin':
            return '--mac';
        case 'linux':
            return '--linux';
        default:
            throw new Error('ERROR_UNKNOWN_PLATFORM');
        }
    })();

    const mirror = process.env.CI ? '' : '--mirror https://npm.taobao.org/mirrors/nwjs/';

    const { code, signal } = await spawnAsync('node', `./dist/bin/build.js ${ platform } --x64 ${ mirror } ${ dir }`.split(' '), {
        stdio: 'inherit',
    });
    t.is(code, 0);

});

test.serial('commandline --config', async (t) => {

    const platform = (() => {
        switch(process.platform) {
        case 'win32':
            return '--win';
        case 'darwin':
            return '--mac';
        case 'linux':
            return '--linux';
        default:
            throw new Error('ERROR_UNKNOWN_PLATFORM');
        }
    })();

    const mirror = process.env.CI ? '' : '--mirror https://npm.taobao.org/mirrors/nwjs/';

    const { code, signal } = await spawnAsync('node', `./dist/bin/build.js ${ platform } --x64 ${ mirror } --config ${ dir }/package.json ${ dir }`.split(' '), {
        stdio: 'inherit',
    });
    t.is(code, 0);

});

(process.env.CI ? test.skip.serial : test.serial)('module', async (t) => {

    const mirror = process.env.CI ? undefined : 'https://npm.taobao.org/mirrors/nwjs/';

    const builder = new Builder({
        win: true,
        mac: true,
        linux: true,
        x64: true,
        mirror,
    }, dir);

    await builder.build();

});
