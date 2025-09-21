// eslint-disable-next-line import/no-extraneous-dependencies
import sass from 'sass';
import fs from 'fs';
import path from 'path';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compileAndSave = async (sassFile) => {
    try {
        const dest = sassFile.replace(path.extname(sassFile), '.css');
        const result = sass.compile(sassFile);

        fs.writeFile(dest, result.css, (err) => {
            if (err) {
                console.error(`Error writing ${dest}:`, err);
                return;
            }
            console.log(`✅ Compiled ${sassFile} to ${dest}`);
        });
    } catch (error) {
        console.error(`❌ Error compiling ${sassFile}:`, error.message);
        // Don't exit the process, just log the error and continue watching
    }
};

const processFiles = async (parent) => {
    const files = await readdir(parent, { withFileTypes: true });
    // eslint-disable-next-line no-restricted-syntax
    for (const file of files) {
        console.log(`${file.name} with extension ${path.extname(file.name)}`);
        if (file.isDirectory()) {
            // eslint-disable-next-line no-await-in-loop
            await processFiles(path.join(parent, file.name));
        }
        if (path.extname(file.name) === '.scss') {
            // eslint-disable-next-line no-await-in-loop
            await compileAndSave(path.join(parent, file.name));
        }
    }
};

// eslint-disable-next-line no-restricted-syntax
for (const folder of ['_src-lp/styles', '_src-lp/blocks']) {
    try {
        // eslint-disable-next-line no-await-in-loop
        await processFiles(path.join(__dirname, folder));
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] === '--watch') {
    console.log('🔍 Watching for SCSS file changes...');
    fs.watch('.', { recursive: true }, (eventType, fileName) => {
        if (path.extname(fileName) === '.scss' && eventType === 'change') {
            console.log(`📝 File changed: ${fileName}`);
            compileAndSave(path.join(__dirname, fileName));
        }
    });

    // Keep the process alive and handle exit gracefully
    process.on('SIGINT', () => {
        console.log('\n👋 SASS watcher stopped');
        process.exit(0);
    });
}
