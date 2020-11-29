/**
 * @typedef {Object} GeneratorOptions
 * @property {string} dir - A path to a directory containing HTML template files.
 * @property {string} outputDir - A directory to which the website content should be placed.
 * @property {Array<string>} ignore - A list of regular expressions indicating files or directories to ignore during generation.
 * @property {string} languages - Supported languages.
 * @property {number} logLevel - Log level. 1 => DEBUG; 2 => INFO; 3 => WARNING; 4 => ERROR.
 */

const process = require("process");
const fs = require("fs");
const path = require("path");
const { processDirectory } = require("./utils");
const { copyFile, processPartial, processTemplate, processCss } = require("./fileProcessors");
const logger = require("./logger");

let config = null;

const fileProcessorsMapping = {
    ".hb": processTemplate,
    ".hbs": processTemplate,
    ".handlebars": processTemplate,
    ".htm": copyFile,
    ".html": copyFile,
    ".css": processCss,
    "_default": copyFile
};

// register partials
function _firstPassAction(filePath) {
    const filePathData = path.parse(filePath);

    const isPartial = [".hb", ".hbs", ".handlebars"].includes(filePathData.ext) && filePathData.name.startsWith("_");
    if (isPartial)
        processPartial(filePathData, config);
}

// compile HB templates
// process non-template files
function _secondPassAction(filePath) {
    const filePathData = path.parse(filePath);
    const processor = fileProcessorsMapping[filePathData.ext] || fileProcessorsMapping._default;
    processor(filePathData, config);
}

/**
 * Generates the website.
 * @param {GeneratorOptions} options - Generator configuration.
 */
function generate(options) {
    // TODO: Validate options

    const cwd = process.cwd();

    config = {
        ...options,
        dir: path.resolve(cwd, options.dir),
        outputDir: path.resolve(cwd, options.outputDir)
    };
    if (config.logLevel)
        logger.setLogLevel(config.logLevel);

    console.log(config.dir);

    if (!fs.existsSync(config.outputDir))
        fs.mkdirSync(config.outputDir);

    processDirectory(config.dir, config.ignore, _firstPassAction);
    processDirectory(config.dir, config.ignore, _secondPassAction);
}

module.exports = generate;