// noinspection JSValidateTypes,JSUnresolvedVariable

// #### THIS FILE WON'T BE RAN ANYWHERE AND MADE FOR IDEs TO PREVENT UNNECESSARY HIGHLIGHTING #### //

const {
    Message,
    GuildTextBasedChannel,
    TextBasedChannel,
    TextBasedChannelFields,
    CommandInteraction,
    Interaction,
    Guild
} = Discord;
/*** @type {Object} */
global.args = {};
/*** @type {Message | Object} */
global.message = {};
/*** @type {CommandInteraction | Interaction | Object} */
global.interaction = {};
/*** @type {GuildTextBasedChannel | TextBasedChannel | TextBasedChannelFields | Object} */
global.channel = {};
/*** @type {Command} */
global.command = {};
global.prefix = "";
global.defaultPrefix = "";
global.stop = a => a;
global.SlashCommandBuilder = Discord.SlashCommandBuilder;
global.SlashCommandAttachmentOption = Discord.SlashCommandAttachmentOption;
global.SlashCommandBooleanOption = Discord.SlashCommandBooleanOption;
global.SlashCommandChannelOption = Discord.SlashCommandChannelOption;
global.SlashCommandMentionableOption = Discord.SlashCommandMentionableOption;
global.SlashCommandIntegerOption = Discord.SlashCommandIntegerOption;
global.SlashCommandSubcommandBuilder = Discord.SlashCommandSubcommandBuilder;
global.SlashCommandSubcommandGroupBuilder = Discord.SlashCommandSubcommandGroupBuilder;
global.SlashCommandNumberOption = Discord.SlashCommandNumberOption;
global.SlashCommandStringOption = Discord.SlashCommandStringOption;
global.SlashCommandRoleOption = Discord.SlashCommandRoleOption;
global.SlashCommandUserOption = Discord.SlashCommandUserOption;
global.SharedSlashCommandOptions = Discord.SharedSlashCommandOptions;
global.SlashCommandAssertions = Discord.SlashCommandAssertions;
/*** @type {Guild | Object} */
global.guild = {};
global.language = new Language();