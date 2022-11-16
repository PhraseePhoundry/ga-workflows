const { exec } = require('child_process');

exec('git tag -l | grep "v[0-9]+.[0-9]+.[0-9]+$" | sort -V | tail -1', (err, tag, stderr) => {
    if (err) {
        console.log('\x1b[33m%s\x1b[0m', 'Could not find any tags because: ');
        console.log('\x1b[31m%s\x1b[0m', stderr);
        if (process.env.INPUT_FALLBACK) {
            console.log('\x1b[33m%s\x1b[0m', 'Falling back to default tag');
            console.log('\x1b[32m%s\x1b[0m', `Found tag: ${process.env.INPUT_FALLBACK}`);
            console.log(`::set-output name=tag::${process.env.INPUT_FALLBACK}`);
            process.exit(0);
        }
        process.exit(1);
    }

    tag = tag.trim()
    console.log('\x1b[32m%s\x1b[0m', `Found tag: ${tag}`);
    console.log(`::set-output name=tag::${tag}`);
});