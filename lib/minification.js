const CleanCSS = require("clean-css");

function compressHtml(src)
{
    // compress
    let minified = src.replace(/\r\n|\n|\t/gi, " ");
    minified = minified.replace(/>\s+</gi, "><").trim();
    minified = minified.replace(/\s{2,}/gi, " ");
    minified = minified.replace(/<!--[\d\D]*?-->/gi, "");

    return minified;
}

function compressCss(src)
{
    const minifier = new CleanCSS();
    const minifierOutput = minifier.minify(src);
    const minified = minifierOutput.styles;

    return minified;
}

function compressXml(src)
{
    const minified = src.replace(/>\s+</gi, "><").trim();
    return minified;
}

exports.compressHtml = compressHtml;
exports.compressCss = compressCss;
exports.compressXml = compressXml;