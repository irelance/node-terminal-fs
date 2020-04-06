const exec = require("child_process").spawnSync;
const os = require('os');
const fs = require('fs');
const path = require('path');

const isWindows = os.type().toLowerCase().match("windows");
if (isWindows) {
    exec('chcp', ['65001']);
}

function errorLog(result) {
    if (result.error) console.error(result.error);
    if (result.stderr && result.stderr.toString()) console.warn(result.stderr.toString());
}

function rm(src) {
    src = path.resolve(src);
    if (!fs.existsSync(src)) {
        console.error('src not exist');
        return false;
    }
    let result;
    if (isWindows) {
        result = exec("rmdir", ['/s', '/q', `"${src}"`], {
            shell: process.env.ComSpec,
        });
    } else {
        result = exec("rm", ["-Rf", src]);
    }
    errorLog(result);
    return !(result.status || result.error);
}

function mv(src, dist, autoFixDist = false) {
    if (!cp(src, dist, autoFixDist)) return false;
    return rm(src);
}

function mkdir(src) {
    src = path.resolve(src);
    if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {
        return
    }
    fs.mkdirSync(src, {recursive: true});
}

function cp(src, dist, autoFixDist = false) {
    if (autoFixDist) {
        dist = path.resolve(dist, path.basename(src));
    }
    src = path.resolve(src);
    dist = path.resolve(dist);
    if (!fs.existsSync(src)) {
        console.error('src not exist');
        return false;
    }
    let result;
    let srcstat = fs.statSync(src);
    if (fs.existsSync(dist) && srcstat.isDirectory() !== fs.statSync(dist).isDirectory()) {
        console.error('dist exist but not same type');
        return false;
    }
    mkdir(srcstat.isDirectory() ? dist : path.dirname(dist));
    if (isWindows) {
        result = srcstat.isDirectory() ? exec("xcopy", [src, dist, '/E', '/R', '/Y'], {
            shell: process.env.ComSpec,
        }) : exec("copy", [src, dist, '/Y'], {
            shell: process.env.ComSpec,
        });
    } else {
        let srcstat = fs.statSync(src);
        result = exec("cp", [srcstat.isDirectory() && fs.existsSync(dist) ? "-RfT" : "-Rf", src, dist]);
    }
    errorLog(result);
    return !(result.status || result.error);
}

module.exports = {
    rm,
    mv,
    cp,
    mkdir,
};
