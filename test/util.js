
import { test } from 'ava';

import { mergeOptions } from '../dist/lib/util';

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
