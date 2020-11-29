const fs = require("fs");
const path = require("path");
const logger = require("./logger");

function _processDirectoryRecur(absPath, ignore, action) {
    if (!fs.existsSync(absPath)) {
        logger.error(`Directory doesn't exist: '${absPath}'`);
        return;
    }

    const items = fs.readdirSync(absPath);
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemPath = path.join(absPath, item);

        if (ignore && ignore.some(r => itemPath.match(r))) {
            logger.debug(`Ignoring: '${itemPath}'`);
            continue;
        }

        const itemStats = fs.statSync(itemPath);
        if (itemStats.isDirectory())
            _processDirectoryRecur(itemPath, ignore, action);
        else
            action(itemPath);
    }
}

function processDirectory(path, ignore, action) {
    _processDirectoryRecur(path, ignore, action);
}

function createDirectory(rootPath, relativePath) {
    const pathParts = relativePath.split(path.sep);
    let currentPath = rootPath;

    for (let i = 0; i < pathParts.length; i++) {
        currentPath = path.join(currentPath, pathParts[i]);

        if (!fs.existsSync(currentPath))
            fs.mkdirSync(currentPath);
    }
}

exports.processDirectory = processDirectory;
exports.createDirectory = createDirectory;