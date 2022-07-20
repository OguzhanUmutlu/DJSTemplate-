(async () => {
    const http = require("https");
    const https = require("https");
    const fs = require("fs");
    const get = url => new Promise((resolve, reject) => {
        const htt = url.startsWith("https") ? https : http;
        htt.get(url, res => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(data));
            res.on("error", err => reject(err));
        }).on("error", err => reject(err));
    });

    get("https://raw.githubusercontent.com/OguzhanUmutlu/DJSTemplate/main/UPDATE.json").then(data => {
        let json;
        try {
            json = JSON.parse(data.toString());
        } catch (err) {
            console.log("Couldn't parse the JSON file from the latest version info!");
            console.error(err);
            return;
        }

        /**
         * @param {string} file
         * @param {string} to
         * @return {Promise<void>}
         */
        function unzip(file, to) {
            if (fs.existsSync(to)) fs.rmSync(to, {recursive: true});
            return new Promise(async (resolve, reject) => fs.createReadStream(file).pipe(require("unzipper").Extract({path: to})).on("error", reject).on("close", resolve));
        }

        get(json["latest"]).then(data => {
            fs.writeFileSync("./update.zip", data.toString());
            unzip("./update.zip", ".").then(async () => {
                await new Promise(r => fs.rm("./update.zip", {recursive: true}, r));
                await new Promise(r => fs.rm(__filename, {recursive: true}, r));
                console.log("Extracted files!");
                console.log("You can now run the project by running the following command:");
                console.log("node index.js");
            }).catch(err => {
                console.log("Couldn't extract files!");
            });
        }).catch(err => {
            console.log("Couldn't get the latest version info!");
            console.error(err);
        });
    }).catch(err => {
        console.log("Couldn't get the latest version info. Please check your internet connection.");
        console.error(err);
    });
})();