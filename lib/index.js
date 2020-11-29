/**
 * @typedef {Object} GeneratorOptions
 * @property {string} dir - A path to a directory containing HTML template files.
 * @property {string} outputDir - A directory to which the website content should be placed.
 * @property {Array<string>} ignore - A list of regular expressions indicating files or directories to ignore during generation.
 * @property {string} languages - Supported languages.
 * @property {number} logLevel - Log level. 1 => DEBUG; 2 => INFO; 3 => WARNING; 4 => ERROR.
 */

const fs = require("fs");
const path = require("path");
const { getMessages } = require("./messagesProvider");
const { processDirectory, createDirectory } = require("./utils");
const Handlebars = require("handlebars");
const logger = require("./logger");

let config = null;

const allowedExtensions = [".hb", ".hbs", ".handlebars"];

function _parseMessageAnnotations(content) {
    const result = [];
    const matches = content.matchAll(/<!-- *@swb messages (.+) *-->/g);
    if (matches) {
        for (let match of matches) {
            result.push(match[1]);
        }
    }
    return result;
}

function compileTemplate(templateSrc, messagesPathTemplates, filePathData, lang) {
    const relativeFileDir = lang ? path.join(lang, path.relative(config.dir, filePathData.dir)) : path.relative(config.dir, filePathData.dir);
    const messages = getMessages(messagesPathTemplates, filePathData.dir, lang);
    createDirectory(config.outputDir, relativeFileDir);
    const template = Handlebars.compile(templateSrc);
    const htmlResult = template(messages);
    const outputPath = path.join(config.outputDir, relativeFileDir, filePathData.name + ".html");
    fs.writeFileSync(outputPath, htmlResult);
}

// register templates
// process non-template files
function _firstPassAction(filePath) {
    const parsedFilePath = path.parse(filePath);
    const relativeFileDir = path.relative(config.dir, parsedFilePath.dir);

    // Is it a HB file?
    if (allowedExtensions.includes(parsedFilePath.ext)) {
        if (parsedFilePath.name.startsWith("_")) {
            const partialName = `${relativeFileDir.replace(/\\/g, '/')}/${parsedFilePath.name}`;
            logger.debug(`Registering partial: '${partialName}'`);
            const partialContent = fs.readFileSync(filePath, "utf8").toString();
            Handlebars.registerPartial(partialName, partialContent);
        }
    }
    else {
        // It is not a HB file, just copy it to the corresponding place in the output directory
        createDirectory(config.outputDir, relativeFileDir);
        const newPath = path.join(config.outputDir, relativeFileDir, parsedFilePath.base);
        logger.debug(`Copying file: '${filePath}' -> '${newPath}'`);
        fs.copyFileSync(filePath, newPath);
    }
}

// compile HB templates
function _secondPassAction(filePath) {
    const parsedFilePath = path.parse(filePath);
    // Is it a HB file?
    if (allowedExtensions.includes(parsedFilePath.ext)) {
        if (!parsedFilePath.name.startsWith("_")) {
            logger.debug(`Compiling template: '${filePath}'`);
            const templateSrc = fs.readFileSync(filePath, "utf8").toString();
            const messagesPathTemplates = _parseMessageAnnotations(templateSrc);
            if (!messagesPathTemplates || !messagesPathTemplates.length) {
                logger.warning(`Messages annotation not found in file '${filePath}'. Skipping...`);
                return;
            }
            if (config.languages && config.languages.length) {
                for (let i = 0; i < config.languages.length; i++) {
                    const lang = config.languages[i];
                    compileTemplate(templateSrc, messagesPathTemplates, parsedFilePath, lang);
                }
            
            }
            else {
                compileTemplate(templateSrc, messagesPathTemplates, parsedFilePath);
            }
        }
    }
}

/**
 * Generates the website.
 * @param {GeneratorOptions} options - Generator configuration.
 */
function generate(options) {
    // TODO: Validate options
    config = { ...options };
    if (config.logLevel)
        logger.setLogLevel(config.logLevel);

    if (!fs.existsSync(config.outputDir))
        fs.mkdirSync(config.outputDir);

    processDirectory(config.dir, config.ignore, _firstPassAction);
    processDirectory(config.dir, config.ignore, _secondPassAction);
}

module.exports = generate;