global.Language = class Language {
    constructor(file, data) {
        this.file = file;
        this.data = data;
    };

    translate(key, args = {}) {
        const v = this.data[key];
        if (typeof v === "string" && args) return Object.keys(args).reduce((a, b) => a.replaceAll(b, args[b]), v);
        return v;
    };
}

global.LanguageManager = new class LanguageManager {
    /*** @type {Object<string, NodeJS.Global.Language>} */
    languages = {};

    /**
     * @param {string} file
     * @return {Promise<NodeJS.Global.Language | void>}
     */
    async loadFile(file) {
        const {err, data} = await readFileAsync(file, "utf8");
        if (err) return printer.error("Couldn't load language file " + file);
        let json;
        try {
            json = JSON.parse(data);
        } catch (e) {
            if (e) return printer.error("Couldn't parse the JSON of " + file);
        }
        return new Language(file, json);
    };

    /*** @param {NodeJS.Global.Language} language */
    addLanguage(language) {
        if (!language) return;
        this.languages[language.file.replaceAll(".json", "")] = language;
    };

    /*** @param {NodeJS.Global.Language | string} fileOrLanguage */
    removeLanguage(fileOrLanguage) {
        if (fileOrLanguage instanceof Language) fileOrLanguage = fileOrLanguage.file;
        delete this.languages[fileOrLanguage.replaceAll(".json", "")];
    };

    async reloadAll() {
        for (const file of Object.keys(this.languages)) await this.addFile(file + ".json");
    };

    async addFile(file) {
        this.addLanguage(await this.loadFile(file));
    };
};