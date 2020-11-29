const generate = require("../../lib/index");

generate({
    dir: "src",
    outputDir: "_dest",
    minify: {
        html: true,
        css: true
    }
});