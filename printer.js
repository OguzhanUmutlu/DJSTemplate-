class Printer {
    static Reset = "\x1b[0m";
    static Bright = "\x1b[1m";
    static Dim = "\x1b[2m";
    static Underscore = "\x1b[4m";
    static Blink = "\x1b[5m";
    static Reverse = "\x1b[7m";
    static Hidden = "\x1b[8m";
    static FgBlack = "\x1b[30m";
    static FgRed = "\x1b[31m";
    static FgGreen = "\x1b[32m";
    static FgYellow = "\x1b[33m";
    static FgBlue = "\x1b[34m";
    static FgMagenta = "\x1b[35m";
    static FgCyan = "\x1b[36m";
    static FgWhite = "\x1b[37m";
    static BgBlack = "\x1b[40m";
    static BgRed = "\x1b[41m";
    static BgGreen = "\x1b[42m";
    static BgYellow = "\x1b[43m";
    static BgBlue = "\x1b[44m";
    static BgMagenta = "\x1b[45m";
    static BgCyan = "\x1b[46m";
    static BgWhite = "\x1b[47m";
    static cns = console;

    static print(...string) {
        if (!require("./config.json").printer.print) return;
        string.forEach(string => Printer.cns.info(string));
    };

    /**
     * @param {string} string
     * @param {"error" | "info" | "notice" | "warn" | "debug"} type
     */
    static log(string, type) {
        if (!require("./config.json").printer[type]) return;
        if (["boolean", "number", "bigint"].includes(typeof string)) string = string.toString();
        else if (["object", "function", "undefined"].includes(typeof string)) string = require("util").inspect(string);
        const bgColor = {
            error: "Red",
            info: "Cyan",
            notice: "Green",
            warn: "Yellow",
            debug: "White"
        }[type];
        const fgColor = {}[type] || bgColor;
        const d = new Date();
        const l = (r, a) => "0".repeat(a - r.toString().length) + r.toString();
        const format = string => `${Printer.BgWhite}${Printer.FgBlack} ${l(d.getHours(), 2)}:${l(d.getMinutes(), 2)}:${l(d.getSeconds(), 2)}.${l(d.getMilliseconds(), 3)} ${Printer.Reset} ${Printer["Bg" + bgColor]}${Printer.FgWhite} ${type.toUpperCase()} ${Printer.Reset} ${Printer["Fg" + fgColor]}${string}${Printer.Reset}`;
        Printer.print(...string.split("\n").map(format));
    };

    print(...string) {
        Printer.print(...string);
    };

    error(...string) {
        string.forEach(string => Printer.log(string, "error"));
    };

    info(...string) {
        string.forEach(string => Printer.log(string, "info"));
    };

    notice(...string) {
        string.forEach(string => Printer.log(string, "notice"));
    };

    warn(...string) {
        string.forEach(string => Printer.log(string, "warn"));
    };

    debug(...string) {
        string.forEach(string => Printer.log(string, "debug"));
    };

    clear() {
        Printer.cns.clear();
    };
}

global.printer = new Printer();