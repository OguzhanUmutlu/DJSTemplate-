console.log("Setup V0.0.1");
(async () => {
    const http = require("https");
    const https = require("https");
    const fs = require("fs");
    const path = require("path");
    const download = (url, file) => new Promise((resolve, reject) => {
        const stream = fs.createWriteStream(file);
        const htt = url.startsWith("https") ? https : http;
        htt.get(url, res => {
            res.pipe(stream);
            res.on("end", () => resolve());
            res.on("error", err => reject(err));
        }).on("error", err => reject(err));
    });
    const get = url => new Promise((resolve, reject) => {
        const htt = url.startsWith("https") ? https : http;
        htt.get(url, res => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(data));
            res.on("error", err => reject(err));
        }).on("error", err => reject(err));
    });

    get("https://raw.githubusercontent.com/OguzhanUmutlu/DJSTemplate/main/UPDATE.json").then(async data => {
        let json;
        try {
            json = JSON.parse(data.toString());
        } catch (err) {
            console.log("Couldn't parse the JSON file from the latest version info!");
            console.error(err);
            return;
        }
        const unzip = (file, to) => new Promise(async (resolve, reject) => fs.createReadStream(file).pipe(require("unzipper").Extract({path: to})).on("error", reject).on("close", resolve));
        const downErr = await download(json["latest"], path.join(__dirname, "update.zip"));
        if (downErr) {
            console.log("Couldn't get the latest version info!");
            console.error(downErr);
            return;
        }
        unzip(path.join(__dirname, "update.zip"), ".").then(async () => {
            await new Promise(r => fs.rm(path.join(__dirname, "update.zip"), {recursive: true}, r));
            await new Promise(r => fs.rm(__filename, {recursive: true}, r));
            console.log("Extracted files!");
            console.log("You can now run the project by running the following command:");
            console.log("node index.js");
        }).catch(err => {
            console.log("Couldn't extract files!");
            console.error(err);
        });
    }).catch(err => {
        console.log("Couldn't get the latest version info. Please check your internet connection.");
        console.error(err);
    });
})();