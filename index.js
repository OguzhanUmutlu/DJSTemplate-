global.config = require("./config.json");
global.commandLikeFormatError = (error, from, to, add = -2) => {
    let string = require("util").inspect(error);
    const lines = string.split("\n");
    for (let i = 1; i < lines.length; i++) {
        let l = lines[i];
        if (l.includes(from)) {
            if (add) {
                const after = l.substring(l.indexOf(from) + from.length);
                if (after.includes(":")) l = l.substring(0, l.indexOf(from) + from.length) + l.substring(l.indexOf(from) + from.length).split(":").map((i, j) => j === 1 ? (i * 1 + add) : i).join(":");
            }
            lines[i] = l.replace(from, to);
        }
    }
    string = lines.join("\n");
    return string;
};

require("./printer");
if (config["no-crash"]) {
    process.on("uncaughtException", printer.error);
    process.on("unhandledRejection", printer.error);
}
printer.clear();
global.Discord = require("discord.js");
global.fs = require("fs");
global.readFileAsync = (file, options) => new Promise(r => fs.readFile(file, options, (err, data) => r({err, data})));
let __uuid = 0;
global.getUniqueId = () => __uuid++;
const path = require("path");
global.executeTerminalCommand = command => new Promise(resolve => {
    require("child_process").exec(command, err => {
        if (err) return resolve({err});
        resolve({success: true});
    });
});
global.mkdir = f => new Promise(r => fs.mkdir(f, r));
(async () => {
    if (await new Promise(r => require("dns").lookup("google.com", err => r(err && err.code === "ENOTFOUND")))) return printer.error("You don't have internet connection!");
    const _dr = __dirname;
    global.rmTmp = () => new Promise(r => fs.rm(path.join(_dr, config.tmp), {recursive: true}, r));
    global.mkTmp = () => mkdir(path.join(_dr, config.tmp));
    await rmTmp();
    await mkTmp();
    if (config.experimental["update-check"].enabled) {
        let latestTemplate;
        try {
            latestTemplate = await (await fetch(config.experimental["update-check"].provider)).json();
            printer.clear();
            const currentVersion = require("./package.json")["template-version"] ?? 1;
            if (latestTemplate.version > currentVersion) printer.warn(...latestTemplate["message"].map(i => i.replaceAll("%latest.version%", latestTemplate.version).replaceAll("%current.version%", currentVersion)));
            else printer.notice("Your template is up to date!");
        } catch (e) {
            printer.clear();
            printer.warn("Couldn't fetch the latest version of the template!")
        }
        if (config.experimental["update-check"]["readline"]) await new Promise(r => require("readline").createInterface({
            input: process.stdin,
            output: process.stdout
        }).question("Press enter to continue...", r));
    }
    printer.clear();
    const {Client, Guild, InteractionType} = Discord;
    global.client = new Client({intents: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536]});
    printer.info("Connecting to Discord...");
    const ready = new Promise(r => client.once("ready", r));
    const loginResponse = await new Promise(r => client.login(config.token).then(_ => r({success: true})).catch(error => r({error})));
    if (loginResponse.error) {
        switch (loginResponse.error.code) {
            case "TokenInvalid":
                return printer.error("Invalid token!")
            case "ENOTFOUND":
                return printer.error("You don't have internet connection!");
            default:
                return printer.error("Failed to log in to Discord! Error code: " + loginResponse.error.code);
        }
    }
    const ______ = config.token;
    if (config["hide-token"]) {
        delete config.token;
        fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
        const endProcess = _ => {
            config.token = ______;
            fs.writeFileSync("./config.json", JSON.stringify(config, null, 2));
            process.exit(0);
        };
        process.on("beforeExit", endProcess);
        process.on("SIGINT", endProcess);
        process.on("SIGTERM", endProcess);
    }
    await ready;
    require("./auto");
    require("./utils/ConfigReader");
    require("./utils/CommandManager");
    require("./utils/LanguageManager");
    require("./utils/Helpers");
    const prefDir = path.join(__dirname, config.prefixCommands.directory);
    await mkdir(prefDir);
    const prefFiles = fs.readdirSync(prefDir).filter(i => i.split(".").length === 2 && i.endsWith(".js"));
    const slashDir = path.join(__dirname, config.slashCommands.directory);
    await mkdir(prefDir);
    const slashFiles = fs.readdirSync(slashDir).filter(i => i.split(".").length === 2 && i.endsWith(".js"));
    const eventDir = path.join(__dirname, config.events.directory);
    await mkdir(eventDir);
    const eventFiles = fs.readdirSync(eventDir).filter(i => i.split(".").length === 2 && i.endsWith(".js"));
    const langDir = path.join(__dirname, config.language.directory);
    await mkdir(langDir);
    const langFiles = fs.readdirSync(langDir).filter(i => i.split(".").length === 2 && i.endsWith(".json"));
    let l = 0;
    const files = [...prefFiles, ...slashFiles, ...eventFiles, ...langFiles];
    const target = files.length;
    const updateCommandMessage = t => {
        printer.clear();
        printer.info("Loading " + t + " " + files[l - 1].split(".")[0] + "...");
        const p = l / target;
        const p1 = Math.floor(p * 40);
        const p2 = Math.floor(p * 10000) / 100;
        printer.info(`[${"=".repeat(Math.min(p1, 14))}${p1 < 14 ? " ".repeat(14 - p1) : ""}${p2}%${"=".repeat(Math.max(p1 - 26, 0))}${p1 > 26 ? " ".repeat(40 - p1) : " ".repeat(14)}] ${l}/${target}`);
    };
    const t = Date.now();
    for (let i = 0; i < prefFiles.length; i++) {
        await PrefixCommandManager.addFile(path.join(prefDir, prefFiles[i]));
        l++;
        updateCommandMessage("prefix command");
    }
    for (let i = 0; i < slashFiles.length; i++) {
        await SlashCommandManager.addFile(path.join(slashDir, slashFiles[i]));
        l++;
        updateCommandMessage("slash command");
    }
    for (let i = 0; i < eventFiles.length; i++) {
        await EventManager.addFile(path.join(eventDir, eventFiles[i]));
        l++;
        updateCommandMessage("event");
    }
    for (let i = 0; i < langFiles.length; i++) {
        await LanguageManager.addFile(path.join(langDir, langFiles[i]));
        l++;
        updateCommandMessage("language");
    }
    const tt = Date.now();
    global.translateStatic = (lang, key, args = []) => LanguageManager.languages[lang].translate(key, args);
    printer.clear();
    printer.info(`${prefFiles.length || "No"} prefix command, ${slashFiles.length || "no"} slash command, ${eventFiles.length || "no"} event and ${langFiles.length || "no"} languages have been loaded in ${tt - t}ms!`);
    client.on("messageCreate", async message => {
        const prefix = getPrefixFromGuild(message.guild);
        if (!message.content.startsWith(prefix)) return;
        const arg = message.content.substring(prefix.length).split(" ");
        const commandName = arg[0];
        const commands = Object.values(PrefixCommandManager.commands).filter(cmd => cmd.conf.enabled && (cmd.conf.name === commandName || (cmd.conf["aliases"] || "").split(",").includes(commandName)) && (cmd.conf["dmAllowed"] || !!message.guild) && (cmd.conf["botAllowed"] || !message.author.bot));
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const result = await cmd.run(message);
            if (result.error) {
                if (config.errors.log) printer.error(`An error occurred while running ${cmd.file}`);
                const errorStack = result.tmp !== undefined ? commandLikeFormatError(result.error, result.tmp, cmd.file, -1) : result.error;
                if (config.errors["log-details"]) printer.error(errorStack);
                if (config.errors["save-details"].enabled) {
                    const format = r => r
                        .replaceAll("{time}", Date.now())
                        .replaceAll("{file.name}", path.basename(cmd.file).split(".").reverse().slice(1).reverse().join("."))
                        .replaceAll("{file.extension}", path.basename(cmd.file).split(".").slice(-1)[0])
                        .replaceAll("{command.name}", cmd.conf.name)
                        .replaceAll("{executor.discriminator}", message.author.discriminator)
                        .replaceAll("{executor.id}", message.author.id.toString())
                        .replaceAll("{error}", errorStack)
                        .replaceAll("{error.message}", result.error.message)
                        .replaceAll("{executor.username}", message.author.username)
                        .replaceAll("{executor.message}", message.content);
                    const file = format(config.errors["save-details"]["file-format"]);
                    const save = format(config.errors["save-details"]["save-format"]);
                    await mkdir(config.errors["save-details"].directory);
                    fs.writeFileSync(path.join(__dirname, config.errors["save-details"].directory, file), save);
                }
            }
        }
    });
    client.on("interactionCreate", async interaction => {
        switch (interaction.type) {
            case InteractionType.Ping:
                break;
            case InteractionType.ApplicationCommand:
                const {commandName} = interaction;
                const commands = (slashCommandCache.get(interaction.guild) || []).filter(i => i[1].name === commandName).map(i => i[0]).filter(cmd => cmd.conf.enabled && (cmd.conf["dmAllowed"] || !!interaction.guild) && (cmd.conf["botAllowed"] || !interaction.user.bot));
                for (let i = 0; i < commands.length; i++) {
                    /*** @type {SlashCommand} */
                    const cmd = commands[i];
                    const result = await cmd.run(interaction);
                    if (result.error) {
                        if (config.errors.log) printer.error(`An error occurred while running ${cmd.file}!`)
                        const errorStack = result.tmp !== undefined ? commandLikeFormatError(result.error, result.tmp, cmd.file, -1) : result.error;
                        if (config.errors["log-details"]) printer.error(errorStack);
                        if (config.errors["save-details"].enabled) {
                            const format = r => r
                                .replaceAll("{time}", Date.now())
                                .replaceAll("{file.name}", path.basename(cmd.file).split(".").reverse().slice(1).reverse().join("."))
                                .replaceAll("{file.extension}", path.basename(cmd.file).split(".").slice(-1)[0])
                                .replaceAll("{command.name}", cmd.conf.name)
                                .replaceAll("{executor.username}", interaction.user.username)
                                .replaceAll("{executor.discriminator}", interaction.user.discriminator)
                                .replaceAll("{executor.id}", interaction.user.id.toString())
                                .replaceAll("{error}", errorStack)
                                .replaceAll("{error.message}", result.error.message);
                            const file = format(config.errors["save-details"]["file-format"]);
                            const save = format(config.errors["save-details"]["save-format"]);
                            await mkdir(config.errors["save-details"].directory);
                            fs.writeFileSync(path.join(__dirname, config.errors["save-details"].directory, file), save);
                        }
                    }
                }
                break;
            case InteractionType.MessageComponent:
                break;
            case InteractionType.ApplicationCommandAutocomplete:
                break;
            case InteractionType.ModalSubmit:
                break;
        }
    });
    const slashCommandCache = new Map();
    /**
     * @param {Guild} guild
     * @param {Object[]} commands
     */
    const updateCommandsForGuild = async (guild, commands) => {
        if (!guild) return {success: false};
        try {
            const cmdMapped = commands.map(i => [i, i.getStructureFromGuild(guild)]);
            await guild.commands.fetch({cache: true});
            // TODO: remove old commands
            await guild.commands.set(cmdMapped.map(i => i[1]));
            slashCommandCache.set(guild, cmdMapped);
            return {success: true};
        } catch (e) {
            printer.info("Couldn't send the slash command packets to the guild with the ID " + guild.id);
            return {success: false, error: e};
        }
    };
    const updateCommandForGuilds = async commands => {
        printer.info("Sending slash command packets to guilds...");
        commands = commands.filter(c => c.conf.enabled);
        const guilds = [];
        for (let i = 0; i < client.guilds.cache.size; i++) {
            const guild = client.guilds.cache.at(i);
            if ((await updateCommandsForGuild(guild, commands)).success) guilds.push(guild);
        }
        printer.info("Slash commands have been updated on " + guilds.length + " guilds!");
        return guilds;
    };
    await updateCommandForGuilds(Object.values(SlashCommandManager.commands));
    let _aid = 0;
    const _aid_c = {};
    const cancelAuto = aid => _aid_c[aid] = true;
    const auto = async (fn, ms, aid = _aid++) => {
        await wait(ms);
        if (_aid_c[aid]) return;
        await fn();
        auto(fn, ms, aid).then(r => r);
        return aid;
    };
    __clearCommandManagerAlertCache();
    if (config.language["auto-reload"].enabled) {
        auto(async () => {
            await mkdir(config.language.directory);
            const dir = path.join(__dirname, config.language.directory);
            const files = fs.readdirSync(dir).filter(i => i.split(".").length === 2 && i.endsWith(".json"));
            let list = [];
            for (let i = 0; i < files.length; i++) list.push(await LanguageManager.loadFile(path.join(dir, files[i])));
            list = list.filter(_ => _);
            const changes = list.filter(lang => !LanguageManager.languages[lang.file.replaceAll(".json", "")] || JSON.stringify(LanguageManager.languages[lang.file.replaceAll(".json", "")].data) !== JSON.stringify(lang.data));
            const deleted = Object.values(LanguageManager.languages).filter(i => !list.map(i => i.file).includes(i.file));
            if (config.language["auto-reload"].log) {
                changes.forEach(i => printer.info("Language file " + i.file + " has been automatically reloaded!"));
                deleted.forEach(i => printer.notice("Language file " + i.file + " has been automatically de-activated due to deletion of the file!"));
            }
            deleted.forEach(i => LanguageManager.removeLanguage(i));
            changes.forEach(i => LanguageManager.addLanguage(i));
        }, config.language["auto-reload"].interval).then(r => r);
    }
    if (config.prefixCommands["auto-reload"].enabled) {
        auto(async () => {
            await mkdir(config.prefixCommands.directory);
            const dir = path.join(__dirname, config.prefixCommands.directory);
            const files = fs.readdirSync(dir).filter(i => i.split(".").length === 2 && i.endsWith(".js"));
            let list = [];
            for (let i = 0; i < files.length; i++) list.push(await PrefixCommandManager.loadFile(path.join(dir, files[i])));
            list = list.filter(_ => _);
            const changes = list.filter(i => !PrefixCommandManager.commands[i.file] || PrefixCommandManager.commands[i.file].raw !== i.raw);
            const deleted = Object.values(PrefixCommandManager.commands).filter(i => !list.map(i => i.file).includes(i.file));
            if (config.prefixCommands["auto-reload"].log) {
                changes.forEach(i => printer.info("Prefix command file " + i.file + " has been automatically reloaded!"));
                deleted.forEach(i => printer.notice("Prefix command file " + i.file + " has been automatically de-activated due to deletion of the file!"));
            }
            deleted.forEach(i => PrefixCommandManager.removeCommand(i));
            changes.forEach(i => PrefixCommandManager.addCommand(i));
        }, config.prefixCommands["auto-reload"].interval).then(r => r);
    }
    if (config.slashCommands["auto-reload"].enabled) auto(async () => {
        await mkdir(config.slashCommands.directory);
        const dir = path.join(__dirname, config.slashCommands.directory);
        const files = fs.readdirSync(dir).filter(i => i.split(".").length === 2 && i.endsWith(".js"));
        let list = [];
        for (let i = 0; i < files.length; i++) list.push(await SlashCommandManager.loadFile(path.join(dir, files[i])));
        list = list.filter(_ => _);
        const changes = list.filter(i => !SlashCommandManager.commands[i.file] || SlashCommandManager.commands[i.file].raw !== i.raw || SlashCommandManager.commands[i.file].structure.toString() !== i.structure.toString());
        const changesStruct = list.filter(i => !SlashCommandManager.commands[i.file] || SlashCommandManager.commands[i.file].structure.toString() !== i.structure.toString());
        const deleted = Object.values(SlashCommandManager.commands).filter(i => !list.map(i => i.file).includes(i.file));
        if (config.slashCommands["auto-reload"].log) {
            changes.forEach(i => printer.info("Slash command file " + i.file + " has been automatically reloaded!"));
            deleted.forEach(i => printer.notice("Slash command file " + i.file + " has been automatically de-activated due to deletion of the file!"));
        }
        const en = Object.values(SlashCommandManager.commands).filter(i => i.conf.enabled);
        deleted.forEach(i => SlashCommandManager.removeCommand(i));
        changes.forEach(i => SlashCommandManager.addCommand(i));
        if (en.length !== Object.values(SlashCommandManager.commands).filter(i => i.conf.enabled).length || [...deleted, ...changesStruct].length) await updateCommandForGuilds(Object.values(SlashCommandManager.commands));
    }, config.slashCommands["auto-reload"].interval).then(r => r);
    if (config.events["auto-reload"].enabled) auto(async () => {
        await mkdir(config.events.directory);
        const dir = path.join(__dirname, config.events.directory);
        const files = fs.readdirSync(dir).filter(i => i.split(".").length === 2 && i.endsWith(".js"));
        let list = [];
        for (let i = 0; i < files.length; i++) list.push(await EventManager.loadFile(path.join(dir, files[i])));
        list = list.filter(_ => _);
        const changes = list.filter(i => !EventManager.events[i.file] || EventManager.events[i.file].raw !== i.raw);
        const deleted = Object.values(EventManager.events).filter(i => !list.map(i => i.file).includes(i.file));
        if (config.events["auto-reload"].log) {
            changes.forEach(i => printer.info("Event file " + i.file + " has been automatically reloaded!"));
            deleted.forEach(i => printer.notice("Event file " + i.file + " has been automatically de-activated due to deletion of the file!"));
        }
        deleted.forEach(i => EventManager.removeEvent(i));
        changes.forEach(i => EventManager.addEvent(i));
    }, config.events["auto-reload"].interval).then(r => r);
    if (config.config["auto-reload"].enabled) auto(async () => {
        try {
            const json = JSON.parse(fs.readFileSync(path.join(_dr, "config.json")).toString());
            if (JSON.stringify(json) !== JSON.stringify(config)) {
                Object.keys(config).forEach(i => delete config[i]);
                Object.keys(json).forEach(i => config[i] = json[i]);
                if (config.slashCommands["auto-reload"].log) printer.info("Config file has been automatically reloaded!");
            }
        } catch (e) {
        }
    }, config.config["auto-reload"].interval).then(r => r);
    const globals = ["config", "printer", "EmbedHelper", "WhiteListHelper", "BlackListHelper", "CooldownHelper", "AsyncLoop", "repeat", "wait", "translateStatic"];
})();