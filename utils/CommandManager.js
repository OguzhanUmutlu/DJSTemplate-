class StopException extends Error {
}

global.StopException = StopException;

const ___________ = (str, __________variables) => eval(str);

(() => {
    async function fileEval(code, vars = {}, uuid = getUniqueId()) {
        await mkTmp();
        const filePath = path.join(path.dirname(__dirname), config.tmp, uuid + "_eval.js");
        fs.writeFileSync(filePath, `module["exports"]=async(${Object.keys(vars).join()})=>{${code}}`);
        const func = require(filePath);
        if (config.experimental["file-eval-remove"]) fs.rmSync(filePath);
        return await func(...Object.values(vars));
    }

    async function parseSlashCommandStruct(code) {
        let result;
        try {
            const importList = [
                "SlashCommandBuilder", "SlashCommandAttachmentOption", "SlashCommandBooleanOption", "SlashCommandChannelOption",
                "SlashCommandMentionableOption", "SlashCommandIntegerOption", "SlashCommandSubcommandBuilder",
                "SlashCommandSubcommandGroupBuilder", "SlashCommandNumberOption", "SlashCommandStringOption", "SlashCommandRoleOption",
                "SlashCommandUserOption", "SharedSlashCommandOptions", "SlashCommandAssertions"
            ];
            switch (config.experimental["command-run-method"]) {
                case "eval":
                    result = ___________(`const {${importList.join(",")}} = Discord;(guild, language) => {return ${code}\n}`);
                    break;
                case "file":
                    result = await fileEval(`const {${importList.join(",")}} = Discord;return (guild, language) => {return ${code}\n}`);
                    break;
            }
            return {success: true, data: result};
        } catch (e) {
            if (e) return {success: false, error: e};
        }
        return {success: false, data: result || null};
    }

    const {CommandInteraction} = Discord;
    const path = require("path");
    const alertCache = {};
    global.__clearCommandManagerAlertCache = () => Object.keys(alertCache).forEach(i => delete alertCache[i]);

    // abstract
    class Command {
        constructor(file, raw, conf) {
            this.file = file;
            this.raw = raw;
            this.conf = conf;
        }

        /**
         * @param {string} key
         * @return {string | number | NaN | null | undefined | boolean}
         */
        getConfigValue(key) {
            return this.conf[key];
        }

        /**
         * @param {string} key
         * @return {boolean}
         */
        hasConfigValue(key) {
            return Object.keys(this.conf).includes(key);
        }

        async run(variables = {}) {
            return await new Promise(res => {
                let tmp = null;
                const r = j => {
                    j.tmp = path.join(path.dirname(__dirname), config.tmp, tmp + "_eval.js");
                    return res(j);
                };
                r._ended = false;
                variables.stop = () => {
                    throw new StopException();
                };
                variables.__________r = r;
                const code = `(async()=>{try{const {${Object.keys(variables).map(i => `${i}`).join(",")}}=__________variables;\n${this.raw}\n__________variables.__________r({success: true, forced: false});}catch(e){if(e instanceof StopException){__________variables.__________r({success: true,forced:true});}else __________variables.__________r({success:false,error:e});}})()`;
                switch (config.experimental["command-run-method"]) {
                    case "eval":
                        ___________(code, variables);
                        break;
                    case "file":
                        tmp = getUniqueId();
                        fileEval(`return await ${code}`, {
                            __________variables: variables,
                            __________r: r
                        }, tmp);
                        break;
                }
            });
        }
    }

    /*class CommandSession {
        constructor(command) {
            this.command = command;
        }

        run() {

        }
    }*/

    class CommandManager {
        /*** @type {Object<string, Command>} */
        commands = {};

        /**
         * @param {string} file
         * @return {Promise<Command | void>}
         */
        async loadFile(file) {
            const {err, data} = await readFileAsync(file, "utf8");
            if (err) {
                alertCache[file] || printer.error("Couldn't load command file " + file);
                alertCache[file] = true;
                return;
            }
            const conf = ConfigReader.read(data, path.basename(file));
            alertCache[file] = false;
            return new Command(file, data, conf);
        };

        /*** @param {Command} command */
        addCommand(command) {
            if (!command) return;
            this.commands[command.file] = command;
        };

        /*** @param {Command | string} fileOrCommand */
        removeCommand(fileOrCommand) {
            if (fileOrCommand instanceof Command) fileOrCommand = fileOrCommand.file;
            delete this.commands[fileOrCommand];
        };

        async reloadAll() {
            for (const file of Object.keys(this.commands)) await this.addFile(file);
        };

        async addFile(file) {
            this.addCommand(await this.loadFile(file));
        };
    }

    class PrefixCommand extends Command {
        constructor(file, raw, conf) {
            super(file, raw, conf);
        }

        async run(message) {
            const prefix = getPrefixFromGuild(message.message);
            const language = getLanguageFromGuild(message.guild);
            const {channel, guild} = message;
            return await super.run({
                message, channel, guild, prefix, language,
                args: message.content.substring(prefix.length).split(" ").slice(1),
                command: this
            });
        }
    }

    class PrefixCommandManager extends CommandManager {
        constructor() {
            super();
            /*** @type {Object<string, PrefixCommand>} */
            this.commands = {};
        }

        /**
         * @param {string} file
         * @return {Promise<PrefixCommand | void>}
         */
        async loadFile(file) {
            const {err, data} = await readFileAsync(file, "utf8");
            if (err) {
                alertCache[file] || printer.error("Couldn't load command file " + file);
                alertCache[file] = true;
                return;
            }
            const conf = ConfigReader.read(data, path.basename(file));
            if (!conf.name) return printer.error("Failed to load prefixed command in " + file + " because the command doesn't have the \"name\" property in its config.");
            alertCache[file] = false;
            return new PrefixCommand(file, data, conf);
        };
    }

    class SlashCommand extends Command {
        constructor(file, raw, conf, structure) {
            super(file, raw, conf);
            this.structure = structure;
        };

        getStructureFromGuild(guild) {
            return this.structure(guild, LanguageManager.languages[getLanguageFromGuild(guild)]);
        };

        /**
         * @param {CommandInteraction} interaction
         * @return {Promise<*>}
         */
        async run(interaction) {
            const {guild, channel} = interaction;
            const language = LanguageManager.languages[getLanguageFromGuild(guild)];
            const structure = this.structure(guild, language);
            let args, subCommand, subCommandGroup;
            if (interaction["_message"]) {
                args = {};
                /*** @type {string[]} */
                const arg = interaction["_arg"];
                const prm = arg.slice(1).join(" ");
                let argsArray = [];
                let m = "";
                let s = null;
                for (let i = 0; i < prm.length; i++) {
                    const c = prm[i];
                    if (s) {
                        if (c === s) {
                            s = null;
                            if (m) argsArray.push(m);
                            m = "";
                        } else m += c;
                    } else {
                        if (c === "\"") {
                            s = c;
                            if (m) argsArray.push(m);
                            m = "";
                        } else if (c === " ") {
                            if (m) argsArray.push(m);
                            m = "";
                        } else m += c;
                    }
                }
                if (m) argsArray.push(m);
                const strOpt = structure.toJSON().options;
                if (strOpt.some(i => i.type === 1 || i.type === 2)) {
                    // sub command only
                    const foundAsSubCommandGroup = strOpt.find(i => i.type === 2 && i.name === argsArray[0] && i.options.some(a => a.type === 1 && a.name === argsArray[1]));
                    const foundAsSubCommand = strOpt.find(i => i.type === 1 && i.name === argsArray[0]);
                    if (foundAsSubCommandGroup) {
                        subCommandGroup = foundAsSubCommandGroup.name;
                        subCommand = foundAsSubCommandGroup.find(i => i.type === 1 && i.name === argsArray[1])?.name;
                        argsArray = argsArray.slice(2);
                    } else if (foundAsSubCommand) {
                        subCommand = foundAsSubCommand.name;
                        argsArray = argsArray.slice(1);
                    }
                }
                argsArray.forEach((i, j) => strOpt[j] ? args[strOpt[j].name] = i : args[j] = i);
                // TODO: a helper that checks things like option types, min-max ranges etc.
            } else {
                args = {};
                const optionData = interaction.options.data;
                subCommand = interaction.options.getSubcommand(false);
                subCommandGroup = interaction.options.getSubcommandGroup(false);
                for (let i = 0; i < optionData.length; i++) {
                    const opt = optionData[i];
                    if (opt.type === 1) {
                        args[opt.name] = {};
                        for (let j = 0; j < opt.options.length; j++) args[opt.name] = opt.value;
                    } else if (opt.type === 2) {
                        args[opt.name] = {};
                        for (let j = 0; j < opt.options.length; j++) {
                            const opt2 = opt.options[j];
                            args[opt.name][opt2.name] = {};
                            for (let k = 0; k < opt2.options.length; k++) args[opt.name][opt2.name][opt2.options[k].name] = opt2.options[k].value;
                        }
                    } else args[opt.name] = opt.value;
                }
                if (subCommandGroup) args = args[subCommandGroup];
                if (subCommand) args = args[subCommand];
            }
            return await super.run({
                interaction, channel, guild, language, structure,
                subCommand, subCommandGroup, args,
                command: this
            });
        };
    }

    class SlashCommandManager extends CommandManager {
        /*** @type {Object<string, SlashCommand>} */
        commands = {};

        getCommands(all = false) {
            if (all) return Object.values(this.commands);
            return Object.values(this.commands).filter(command => command.conf.enabled);
        }

        /**
         * @param {string} file
         * @return {Promise<SlashCommand | void>}
         */
        async loadFile(file) {
            const {err: errFile, data: dataFile} = await readFileAsync(file, "utf8");
            if (errFile) {
                alertCache[file] || printer.error("Couldn't load command file " + file);
                alertCache[file] = true;
                return;
            }
            const conf = ConfigReader.read(dataFile, path.basename(file));
            const structFile = file.split("").reverse().join("").replace("sj.", "sj.tcurts.").split("").reverse().join("");
            const {err: errStruct, data: dataStruct} = await readFileAsync(structFile, "utf8");
            if (errStruct) {
                alertCache[file] || printer.error("Couldn't load the structure file of slash command " + file + " which is " + structFile + ". Please create a file called " + structFile + " and add slash command structure. Detailed information about how to add slash command structure: https://github.com/OguzhanUmutlu/DJSTemplate");
                alertCache[file] = true;
                return;
            }
            const structData = await parseSlashCommandStruct(dataStruct);
            if (structData.error) {
                alertCache[file] || printer.error("Couldn't load the structure file " + structFile, "\n", structData.error);
                alertCache[file] = true;
                return;
            }
            if (!structData.success) {
                alertCache[file] || printer.error("Couldn't load the structure file " + structFile + " for an unknown reason.");
                alertCache[file] = true;
                return;
            }
            alertCache[file] = false;
            return new SlashCommand(file, dataFile, conf, structData.data);
        };
    }

    class Event extends Command {
        constructor(file, raw, conf) {
            super(file, raw, conf);
            this.lastSign = null;
        }

        async run(...args) {
            return await super.run({
                args, event: this
            });
        }
    }

    class EventManager {
        /*** @type {Object<string, Event>} */
        events = {};

        /**
         * @param {string} file
         * @return {Promise<Event | void>}
         */
        async loadFile(file) {
            const {err, data} = await readFileAsync(file, "utf8");
            if (err) {
                alertCache[file] || printer.error("Couldn't load event file " + file);
                alertCache[file] = true;
                return;
            }
            const conf = ConfigReader.read(data, path.basename(file));
            alertCache[file] = false;
            return new Event(file, data, conf);
        };

        /*** @param {Event | Object} event */
        addEvent(event) {
            if (!event) return;
            if (event.lastSign) client.off(event.lastSign[0], event.lastSign[1]);
            event.lastSign = [event.conf.name, async (...args) => {
                const result = await event.run(...args);
                if (result.error) {
                    if (config.errors.log) printer.error(`An error occurred while running ${event.file}!`);
                    const errorStack = result.tmp !== undefined ? commandLikeFormatError(result.error, result.tmp, event.file, -1) : result.error;
                    if (config.errors["log-details"]) printer.error(errorStack);
                    if (config.errors["save-details"].enabled) {
                        const format = r => r
                            .replaceAll("{time}", Date.now())
                            .replaceAll("{file.name}", path.basename(event.file).split(".").reverse().slice(1).reverse().join("."))
                            .replaceAll("{file.extension}", path.basename(event.file).split(".").slice(-1)[0])
                            .replaceAll("{command.name}", event.conf.name)
                            .replaceAll("{error}", errorStack)
                            .replaceAll("{error.message}", result.error.message);
                        const file = format(config.errors["save-details"]["file-format"]);
                        const save = format(config.errors["save-details"]["save-format"]);
                        fs.writeFileSync(path.join(__dirname, config.errors["save-details"].directory, file), save);
                    }
                }
            }];
            client.on(event.lastSign[0], event.lastSign[1]);
            this.events[event.file] = event;
        };

        /*** @param {Event | Object | string} fileOrEvent */
        removeEvent(fileOrEvent) {
            if (!(fileOrEvent instanceof Event)) fileOrEvent = this.events[fileOrEvent];
            if (fileOrEvent.lastSign) client.off(fileOrEvent.lastSign[0], fileOrEvent.lastSign[1]);
            fileOrEvent.lastSign = null;
            delete this.events[fileOrEvent.file];
        };

        async reloadAll() {
            for (const file of Object.keys(this.events)) await this.addFile(file);
        };

        async addFile(file) {
            this.addEvent(await this.loadFile(file));
        };
    }

    global.Command = Command;
    global.CommandManager = CommandManager;
    global.PrefixCommand = PrefixCommand;
    global.PrefixCommandManager = new PrefixCommandManager();
    global.SlashCommand = SlashCommand;
    global.SlashCommandManager = new SlashCommandManager();
    global.Event = Event;
    global.EventManager = new EventManager();
})();