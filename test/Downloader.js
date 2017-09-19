
import { test } from 'ava';

import { Downloader } from '../';

test('fetch', async (t) => {

    const mirror = process.env.CI ? undefined : 'https://npm.taobao.org/mirrors/nwjs/';

    const downloader = new Downloader({
        platform: process.platform,
        arch: 'x64',
        version: 'lts',
        flavor: 'normal',
        mirror,
    });

    await downloader.fetch();

});
