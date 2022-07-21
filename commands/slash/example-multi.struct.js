new SlashCommandBuilder()
    .addStringOption(opt => opt.setName("test").setDescription("optStr"))
    .addStringOption(opt => opt.setName("test").setDescription("optStr"))
    .addStringOption(opt => opt.setName("test").setDescription("optStr"))
    .addStringOption(opt => opt.setName("test").setDescription("optStr"))
    .setDescription("example, " + guild.name)
    .setName("multi-example")
// Docs: https://discord.js.org/#/docs/builders/main/class/SlashCommandBuilder
// You can also use "guild" and "language" variables to customize things!