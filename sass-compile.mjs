import sass from 'sass';
import fs from 'fs';
import path from 'path';
import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const compileAndSave = async (sassFile) => {
    const dest = sassFile.replace(path.extname(sassFile), ".css");

    fs.writeFile(dest, sass.compile(sassFile).css, (err) => {
        if (err) console.log(err);
        console.log(`Compiled ${sassFile} to ${dest}`);
    });
}

const processFiles = async (parent) => {
    let files = await readdir(parent, { withFileTypes: true});
    for (const file of files) {
        console.log(`${file.name} with extension ${path.extname(file.name)}`);
        if (file.isDirectory()) {
            await processFiles(path.join(parent, file.name));
        }
        if (path.extname(file.name) === '.scss') {
            await compileAndSave(path.join(parent, file.name));
        }
    }
}

for (const folder of ["_src-lp/styles","_src-lp/blocks"]) {
    try {
        await processFiles(path.join(__dirname, folder));
    } catch (err) {
        console.error(err);
    }
}

if (process.argv[2] === '--watch') {
    fs.watch('.', {recursive: true}, (eventType, fileName) => {
        if (path.extname(fileName) === ".scss" && eventType === "change") {
            compileAndSave(path.join(__dirname, fileName));
        }
    })
}