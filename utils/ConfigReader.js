global.ConfigReader = class ConfigReader {
    /**
     * @param {string} string
     * @param {string} file
     * @return {Object}
     */
    static read(string, file) {
        string = string.replace(/\r\n/g, "\n");
        const matchArrayFrom = iterator => {
            let done = false;
            const list = [];
            while (!done) {
                const i = iterator.next();
                if (i.done) done = true;
                if (i.value) list.push(i.value);
            }
            return list;
        }
        const comments = matchArrayFrom(string.matchAll(/^(( *\/\*+\n( *\*? *.+\n)+ *\*+\/)|( *\/\/+ *@.+))/gm)).map(i => i[0].replace(/^ +/gm, ""));
        const conf = {};
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            const parse = str => {
                if (str === "true" || !str) return true;
                if (str === "false") return false;
                if (str === "NaN") return NaN;
                if (str === "null") return null;
                if (str === "undefined") return undefined;
                if (!isNaN(str * 1)) return str * 1;
                return str;
            };
            const addToConf = c => c[0] && c[0].startsWith("@") ? (conf[c[0]] ? printer.warn("The command config key \"" + conf[c[0]] + "\" cannot be redeclared! File: " + file) : (conf[c[0].substring(1)] = parse(c.slice(1).join(" ")))) : null;
            if (comment.startsWith("/*")) {
                const c = comment.split("\n").slice(1, -1).map(line => line.replace(/^\*+/gm, "").replace(/^ +/gm, " ").split(" ").filter(i => i)).filter(i => i[0]);
                c.forEach(addToConf);
            } else addToConf(comment.replace(/^\/+/gm, "").replace(/^ +/gm, " ").split(" ").filter(i => i))
        }
        return conf;
    };

    static format(text) {
        printer.error("Config formatting hasn't been implemented yet!");
        // TODO: make it, so it will be like key-value table which keys are centered in themselves and same for values.
        return undefined;
    };
};