
import { test } from 'ava';

import { FFmpegDownloader } from '../dist/lib/FFmpegDownloader';

test.failing('symbol version not supported', async (t) => {

    const downloader = new FFmpegDownloader({
        platform: process.platform,
        arch: 'x64',
        version: 'lts',
    });

    await downloader.fetch();

});

test('fetch', async (t) => {

    const downloader = new FFmpegDownloader({
        platform: process.platform,
        arch: 'x64',
        version: '0.14.7',
    });

    await downloader.fetch();

});
