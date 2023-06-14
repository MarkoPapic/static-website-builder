const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const { getMessages } = require("./messagesProvider");
const { createDirectory } = require("./utils");
const { compressHtml, compressCss, compressXml } = require("./minification");
const logger = require("./logger");

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

function _compileTemplate(templateSrc, messagesPathTemplates, filePathData, lang) {
    const messages = getMessages(messagesPathTemplates, filePathData.dir, lang);
    const template = Handlebars.compile(templateSrc);
    const htmlResult = template(messages);
    return htmlResult;
}

function _writeFileToOutput(content, filePathData, config, options = {}) {
    const relativeFileDir = options.lang ? path.join(options.lang, path.relative(config.dir, filePathData.dir)) : path.relative(config.dir, filePathData.dir);
    createDirectory(config.outputDir, relativeFileDir);
    const outputPath = path.join(config.outputDir, relativeFileDir, `${filePathData.name}${options.extension || filePathData.ext}`);
    fs.writeFileSync(outputPath, content);
}

function copyFile(filePathData, config) {
    const relativeFileDir = path.relative(config.dir, filePathData.dir);
    createDirectory(config.outputDir, relativeFileDir);
    const filePath = path.join(filePathData.dir, filePathData.base);
    const newPath = path.join(config.outputDir, relativeFileDir, filePathData.base);
    fs.copyFileSync(filePath, newPath);
}

function processPartial(filePathData, config) {
    const filePath = path.join(filePathData.dir, filePathData.base);
    const relativeFileDir = path.relative(config.dir, filePathData.dir);
    const partialName = `${relativeFileDir.replace(/\\/g, '/')}/${filePathData.name}`;
    const partialContent = fs.readFileSync(filePath, "utf8").toString();
    Handlebars.registerPartial(partialName, partialContent);
}

function processTemplate(filePathData, config) {
    // Don't process partials
    if (!filePathData.name.startsWith("_")) {
        const filePath = path.join(filePathData.dir, filePathData.base);
        const templateSrc = fs.readFileSync(filePath, "utf8").toString();

        const messagesPathTemplates = _parseMessageAnnotations(templateSrc);
        if (!messagesPathTemplates || !messagesPathTemplates.length) {
            logger.warning(`Messages annotation not found in template '${filePath}'. Skipping...`);
            return;
        }

        if (config.languages && config.languages.length) {
            for (let i = 0; i < config.languages.length; i++) {
                const lang = config.languages[i];
                let htmlResult = _compileTemplate(templateSrc, messagesPathTemplates, filePathData, lang);
                if (config.minify && config.minify.html)
                    htmlResult = compressHtml(htmlResult);
                _writeFileToOutput(htmlResult, filePathData, config, { lang: lang, extension: ".html" })
            }
        }
        else {
            let htmlResult = _compileTemplate(templateSrc, messagesPathTemplates, filePathData);
            if (config.minify && config.minify.html)
                htmlResult = compressHtml(htmlResult);
            _writeFileToOutput(htmlResult, filePathData, config, { extension: ".html" });
        }
    }
}

function processCss(filePathData, config) {
    const filePath = path.join(filePathData.dir, filePathData.base);
    if (config.minify && config.minify.css) {
        const src = fs.readFileSync(filePath, "utf8").toString();
        const cssResult = compressCss(src);
        _writeFileToOutput(cssResult, filePathData, config);
    }
    else {
        copyFile(filePathData, config);
    }
}

function processXml(filePathData, config) {
    const filePath = path.join(filePathData.dir, filePathData.base);
    if (config.minify && config.minify.xml) {
        const src = fs.readFileSync(filePath, "utf8").toString();
        const xmlResult = compressXml(src);
        _writeFileToOutput(xmlResult, filePathData, config);
    }
    else {
        copyFile(filePathData, config);
    }
}

function ignore(filePathData, config) {}

exports.copyFile = copyFile;
exports.processPartial = processPartial;
exports.processTemplate = processTemplate;
exports.processCss = processCss;
exports.processXml = processXml;
exports.ignore = ignore;