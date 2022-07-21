const https = require("https");
const http = require("http");
const fs = require("fs");
const ZIP = require("zip");
const path = require("path");
const isRequire = require.main !== module;
console.clear();
console.log("Setup V0.0.4");
module.exports = new Promise(async resFile => {
    global.executeTerminalCommand = command => new Promise(resolve => {
        require("child_process").exec(command, err => {
            if (err) return resolve({err});
            resolve({success: true});
        });
    });
    /*const download = (url, file) => new Promise(async (resolve, reject) => {
        const stream = fs.createWriteStream(file, {
            encoding: null
        });
        const htt = url.startsWith("https") ? https : http;
        htt.get(url, res => {
            res.pipe(stream);
            res.on("close", () => resolve());
            res.on("error", err => reject(err));
        }).on("error", err => reject(err));
    });*/

    const get = url => new Promise(async (resolve, reject) => {
        const htt = url.startsWith("https") ? https : http;
        htt.get(url, res => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => resolve(data));
            res.on("error", err => reject(err));
        }).on("error", err => reject(err));
    });
    const {stdin} = process;

    class ConsoleReader {
        static resumeStdin() {
            stdin.resume();
            stdin.setEncoding("utf8");
        };

        static pauseStdin() {
            stdin.pause();
        }

        static onStdinData(callback) {
            stdin.on("data", callback);
            return {remove: () => stdin.off("data", callback)};
        };

        static readLine({show = false} = {}) {
            return new Promise(resolve => {
                this.resumeStdin();
                let dat = "";
                const rem = this.onStdinData(data => {
                    if (data === "\x03") return process.exit();
                    if (data[0] === "\n" || data[0] === "\r") {
                        this.pauseStdin();
                        rem.remove();
                        resolve(dat);
                    } else if (data === "\b") {
                        if (dat.length > 0) {
                            dat = dat.substring(0, dat.length - 1);
                            if (show) process.stdout.write("\b ");
                        }
                    } else dat += data;
                    if (show) process.stdout.write(data);
                });
            });
        };

        static readKey({show = false, amount = 1} = {}) {
            return new Promise(resolve => {
                this.resumeStdin();
                let dat = "";
                const rem = this.onStdinData(data => {
                    if (data === "\x03") return process.exit();
                    if (data === "\b") {
                        if (dat.length > 0) {
                            dat = dat.substring(0, dat.length - 1);
                            if (show) process.stdout.write("\b ");
                        }
                    } else dat += data;
                    if (dat.length >= amount) {
                        this.pauseStdin();
                        rem.remove();
                        resolve(dat);
                    }
                    if (show) process.stdout.write(data);
                });
            });
        };
    }

    get("https://raw.githubusercontent.com/OguzhanUmutlu/DJSTemplate/main/UPDATE.json").then(async data => {
        let json;
        try {
            json = JSON.parse(data.toString());
        } catch (err) {
            console.log("Couldn't parse the JSON file from the latest version info!");
            console.error(err);
            return;
        }
        const unzip = async (from, to, cb) => {
            const data = fs.readFileSync(from);
            const reader = ZIP.Reader(data);
            reader.toObject();
            const list = {};
            reader.forEach(entry => list[entry._header.file_name] = new ZIP.Entry(entry._header, entry._realStream, entry._start, entry._compressedSize, entry._compressionMethod, entry._mode));
            for (let i = 0; i < Object.keys(list).length; i++) {
                const file_name = Object.keys(list)[i];
                const full_file_name = path.join(to, file_name);
                const entry = list[file_name];
                if (!(await cb({file_name, full_file_name, entry}))) continue;
                await new Promise(r => fs.mkdir(path.dirname(full_file_name), {recursive: true}, r));
                if (fs.existsSync(full_file_name)) fs.rmSync(full_file_name, {recursive: true});
                if (entry.isFile()) {
                    fs.writeFileSync(full_file_name, entry.getData());
                } else {
                    fs.mkdirSync(full_file_name);
                }
            }
        }
        //const unzip = (file, to) => new Promise(async (resolve, reject) => fs.createReadStream(file).pipe(require("unzipper").Extract({path: to})).on("error", reject).on("close", resolve));
        //const downErr = await download(json["latest"], path.join(__dirname, "update.zip"));
        const down = await executeTerminalCommand(`curl ${JSON.stringify(json["latest"])} -o ./update.zip`);
        //console.log(fs.readFileSync("./update2.zip").toString().length)
        //if(downErr) {
        // TODO: make this with node methods instead of the terminal
        if (down.err || !down.success) {
            console.log("Couldn't get the latest version info!");
            console.error(down.err);
            //console.error(downErr);
            return;
        }
        stdin.setRawMode(true);
        await unzip(path.join(__dirname, "update.zip"), ".", async ({file_name, full_file_name, entry}) => {
            if (fs.existsSync(full_file_name)) {
                if (full_file_name.endsWith("config.json")) return false;
                if (entry.isDirectory()) return false;
                let r;
                while (!["y", "n"].includes(r || "")) {
                    process.stdout.write("Do you want to update an already existing file located in \"" + full_file_name + "\"? (y/n) ");
                    r = await ConsoleReader.readLine({show: true});
                    process.stdout.write("\n");
                }
                return r === "y";
            }
            return true;
        });
        await new Promise(r => fs.rm(path.join(__dirname, "update.zip"), {recursive: true}, r));
        await new Promise(r => fs.rm(path.join(__dirname, "setup.cmd"), {recursive: true}, r));
        await new Promise(r => fs.rm(path.join(__dirname, "setup.sh"), {recursive: true}, r));
        await new Promise(r => fs.rm(__filename, {recursive: true}, r));
        console.log("Extracted files!");
        process.stdout.write("Press any key to continue...");
        ConsoleReader.resumeStdin();
        resFile();
        ConsoleReader.onStdinData(process.exit);
    }).catch(err => {
        console.log("Couldn't get the latest version info. Please check your internet connection.");
        console.error(err);
    });
});