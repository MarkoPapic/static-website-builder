const generate = require("../../lib/index");

generate({
    dir: "./src",
    outputDir: "./_dest",
    languages: [ "en", "es" ]
});