global.getPrefixFromGuild = guild => {
    // You can add custom prefix using this!
    return config.prefixCommands["default-prefix"];
};
global.getLanguageFromGuild = guild => {
    // You can add custom language using this!
    return config.language.default;
};