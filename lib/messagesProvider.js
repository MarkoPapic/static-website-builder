const fs = require("fs");
const path = require("path");

const messagesPathLanguagePlaceholder = "<lang>";

function getMessages(templates, baseDir, lang) {
    let messages = {};
    for (let i = 0; i < templates.length; i++) {
        const pathTemplate = templates[i];
        const relativePath = lang ? pathTemplate.replace(messagesPathLanguagePlaceholder, lang) : pathTemplate;
        const partPath = path.join(baseDir, relativePath);
        const partJson = fs.readFileSync(partPath, "utf8").toString();
        const part = JSON.parse(partJson);
        messages = { ...messages, ...part };
    }
    if (lang)
        messages.__lang = lang;
    return messages;
}

exports.getMessages = getMessages;