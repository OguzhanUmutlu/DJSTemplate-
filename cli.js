(async () => {
    const fs = require("fs");
    require("./printer");
    console.clear();
    const argv = process.argv.slice(2);

    switch (argv[0]) {
        case "format-config":
            const file = argv[1];
            if (!file) return printer.error("You should have specified a file.");
            require("./utils/ConfigReader");
            global.readFileAsync = (file, options) => new Promise(r => fs.readFile(file, options, (err, data) => r({
                err,
                data
            })));
            const data = await readFileAsync(file);
            if (data.err) {
                switch (data.err.code) {
                    case "ENOENT":
                        return printer.error("Couldn't find a directory or file at \"" + file + "\"");
                    case "EISDIR":
                        return printer.error("Specified path \"" + file + "\" is a directory, file expected.");
                }
                return printer.error(data.err);
            }
            const formatted = ConfigReader.format(data);
            if (formatted === undefined) return;
            fs.writeFileSync(file, formatted);
            printer.notice("File has been formatted!")
            break;
        default:
            return printer.error("Usage: node cli <format-config>");
    }
})();