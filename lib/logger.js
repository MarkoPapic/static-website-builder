const logLevels = {
    DEBUG: 1,
    INFO: 2,
    WARINNG: 3,
    ERROR: 4
};

let logLevel = 2;

const loggers = [];

const consoleLogger = {
    debug: console.debug,
    info: console.log,
    warning: console.warn,
    error: console.error
};

function registerLogger(logger) {
    loggers.push(logger);
}

function setLogLevel(level) {
    logLevel = level;
}

function logDebug(message) {
    if (logLevel > logLevels.DEBUG)
        return;

    for (let i = 0; i < loggers.length; i++)
        loggers[i].debug(message);
}

function logInfo(message) {
    if (logLevel > logLevels.INFO)
        return;

    for (let i = 0; i < loggers.length; i++)
        loggers[i].info(message);
}

function logWarning(message) {
    if (logLevel > logLevels.WARINNG)
        return;

    for (let i = 0; i < loggers.length; i++)
        loggers[i].warning(message);
}

function logError(message) {
    if (logLevel > logLevels.ERROR)
        return;

    for (let i = 0; i < loggers.length; i++)
        loggers[i].error(message);
}

registerLogger(consoleLogger);

module.exports = {
    debug: logDebug,
    info: logInfo,
    warning: logWarning,
    error: logError,
    logLevels: {...logLevels},
    setLogLevel: setLogLevel
};