// noinspection JSUnusedGlobalSymbols

const {
    ButtonInteraction, Message, ReactionEmoji, User,
    ModalSubmitInteraction, Role, PermissionsBitField, BaseChannel, GuildMember
} = Discord;

let ButtonHelper = new class ButtonHelper {
    /*** @type {[string, function(ButtonInteraction)][]} */
    registered = [];

    /**
     * @param {string} customId
     * @param {function(ButtonInteraction)} callback
     */
    register(customId, callback) {
        this.registered.push([customId, callback]);
    };

    /**
     * @param {string} customId
     * @return {Promise<ButtonInteraction>}
     */
    async waitButton(customId) {
        let callback;
        return await new Promise(r => this.register(customId, callback = (interaction => {
            r(interaction);
            this.unregister(customId, callback);
        })));
    };

    /**
     * @param {string} button
     * @param {function(ButtonInteraction)?} callback
     */
    unregister(button, callback) {
        this.registered = this.registered.filter(a => a[0] !== button && (!callback || a[1] !== callback));
    };
};

let ReactionHelper = new class ReactionHelper {
    /*** @type {[Message, ReactionEmoji, function(User)][]} */
    registered = [];

    /**
     * @param {Message} message
     * @param {ReactionEmoji} reaction
     * @param {function(User)} callback
     * @return {ReactionEmoji}
     */
    register(message, reaction, callback) {
        message.guild.members.fetch("123456789012345678")
        this.registered.push([message, reaction, callback]);
        return reaction;
    };

    /**
     * @param {Message} message
     * @param {ReactionEmoji} reaction
     * @return {Promise<User>}
     */
    async waitHelper(message, reaction) {
        let callback;
        return await new Promise(r => this.register(message, reaction, callback = (user => {
            r(user);
            this.unregister(message, reaction, callback);
        })));
    };

    /**
     * @param {Message} message
     * @param {ReactionEmoji} reaction
     * @param {function(User)?} callback
     * @return {ReactionEmoji}
     */
    unregister(message, reaction, callback) {
        this.registered = this.registered.filter(a => a[0] !== message && a[1] !== reaction && (!callback || a[2] !== callback));
        return reaction;
    };
};

let ModalHelper = new class ModalHelper {
    /*** @type {[string, function(ModalSubmitInteraction)][]} */
    registered = [];

    /**
     * @param {string} customId
     * @param {function(ModalSubmitInteraction)} callback
     */
    register(customId, callback) {
        this.registered.push([customId, callback]);
    };

    /**
     * @param {string} customId
     * @return {Promise<ModalSubmitInteraction>}
     */
    async waitHelper(customId) {
        let callback;
        return await new Promise(r => this.register(customId, callback = (interaction => {
            r(interaction);
            this.unregister(customId, callback);
        })));
    };

    /**
     * @param {string} customId
     * @param {function(ModalSubmitInteraction)?} callback
     */
    unregister(customId, callback) {
        this.registered = this.registered.filter(a => a[0] !== customId && (!callback || a[1] !== callback));
    };
};

class EmbedHelperError extends Error {
}

class EmbedHelper {
    static ERROR_CLASS = EmbedHelperError;

    static TYPE = {
        RICH: "rich",
        IMAGE: "image",
        VIDEO: "video",
        GIFV: "gifv",
        ARTICLE: "article",
        LINK: "link"
    };

    static EXAMPLE = {
        title: "",
        type: EmbedHelper.TYPE.RICH,
        description: "",
        url: "",
        timestamp: "",
        color: 0,
        footer: {
            text: "",
            icon_url: "",
            proxy_icon_url: ""
        },
        image: {
            url: "",
            proxy_url: "",
            height: 0,
            width: 0
        },
        thumbnail: {
            url: "",
            proxy_url: "",
            height: 0,
            width: 0
        },
        video: {
            url: "",
            proxy_url: "",
            height: 0,
            width: 0
        },
        provider: {
            name: "",
            url: ""
        },
        author: {
            name: "",
            url: "",
            icon_url: "",
            proxy_icon_url: ""
        },
        fields: [
            {
                name: "",
                value: "",
                inline: false
            }
        ]
    };

    /*** @param {{title?: string, type?: string, description?: string, url?: string, timestamp?: string, color?: number, footer?: {text: string, icon_url?: string, proxy_icon_url?: string}, image?: {url: string, proxy_url?: string, height?: number, width?: number}, thumbnail?: {url: string, proxy_url?: string, height?: number, width?: number}, video?: {url: string, proxy_url?: string, height?: number, width?: number}, provider?: {name?: string, url?: string}, author?: {name: string, url?: string, icon_url?: string, proxy_icon_url?: string}, fields?: {name: string, value: string, inline?: boolean}[]}?} data */
    constructor(data = {}) {
        this.data = data;
    };

    /*** @param {string} title */
    setTitle(title) {
        if (typeof title !== "string") throw new EmbedHelperError("Embed titles should be type of string.");
        if (title.length > 256) throw new EmbedHelperError("Embed titles are limited to 256 characters.");
        this.data.title = title;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {"rich" | "image" | "video" | "gifv" | "article" | "link"} type */
    setType(type) {
        if (![EmbedHelper.TYPE.RICH, EmbedHelper.TYPE.ARTICLE, EmbedHelper.TYPE.GIFV, EmbedHelper.TYPE.LINK, EmbedHelper.TYPE.IMAGE, EmbedHelper.TYPE.VIDEO].includes(type)) throw new EmbedHelperError("Embed types should be one of these: rich, image, video, gifv, article, link");
        this.data.type = type;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} description */
    setDescription(description) {
        if (typeof description !== "string") throw new EmbedHelperError("Embed descriptions should be type of string.");
        if (description.length > 4096) throw new EmbedHelperError("Embed descriptions are limited to 4096 characters.");
        this.data.description = description;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} url */
    setURL(url) {
        if (typeof url !== "string") throw new EmbedHelperError("Embed urls should be type of string.");
        this.data.url = url;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {number} timestamp */
    setTimestamp(timestamp = Date.now()) {
        if (typeof timestamp !== "number") throw new EmbedHelperError("Embed timestamps should be type of string.");
        this.data.timestamp = timestamp.toString();
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string | number} color */
    setColor(color) {
        if (typeof color === "string") {
            if (!/\b[\dA-F]{6}\b/gi.test(color)) throw new EmbedHelperError("Embed hex color should be a valid hex color.");
            color = parseInt(color.substring(1), 16);
        }
        if (typeof color !== "number") throw new EmbedHelperError("Embed colors should be type of number.");
        if (Math.floor(color) !== color) throw new EmbedHelperError("Embed colors should not be floating point numbers");
        if (color < 0x000000 || color > 0xffffff) throw new EmbedHelperError("Embed colors should be between #000000(" + 0x000000 + ") and #ffffff(" + 0xffffff + ").");
        this.data.color = color;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /**
     * @param {string | {text: string, iconURL?: string, icon_url?: string, proxyIconURL?: string, proxy_icon_url?: string}} text
     * @param {string?} iconURL
     * @param {string?} proxyIconURL
     */
    setFooter(text, iconURL, proxyIconURL) {
        if (typeof text === "object") {
            iconURL = text.iconURL || text.icon_url;
            proxyIconURL = text.proxyIconURL || text.proxy_icon_url;
            text = text.text;
        }
        this.setFooterText(text);
        this.setFooterIconURL(iconURL);
        this.setFooterProxyIconURL(proxyIconURL);
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} text */
    setFooterText(text) {
        if (typeof text !== "string") throw new EmbedHelperError("Embed footer texts should be type of string.");
        if (text.length > 2048) throw new EmbedHelperError("Embed texts are limited to 2048 characters.");
        if (!this.data.footer) this.data.footer = {};
        this.data.footer.text = text;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string | undefined} iconURL */
    setFooterIconURL(iconURL) {
        if (iconURL !== undefined && typeof iconURL !== "string") throw new EmbedHelperError("Embed footer icon urls should be type of string.");
        if (!this.data.footer) this.data.footer = {};
        this.data.footer.icon_url = iconURL;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string | undefined} proxyIconURL */
    setFooterProxyIconURL(proxyIconURL) {
        if (proxyIconURL !== undefined && typeof proxyIconURL !== "string") throw new EmbedHelperError("Embed footer proxy icon urls should be type of string.");
        if (!this.data.footer) this.data.footer = {};
        this.data.footer.proxy_icon_url = proxyIconURL;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /**
     * @param {string | {url: string, proxyURL?: string, proxy_url?: string, width?: number, height?: number}} url
     * @param {string?} proxyURL
     * @param {number?} width
     * @param {number?} height
     */
    setImage(url, proxyURL, width, height) {
        if (typeof url === "object") {
            proxyURL = url.proxyURL || url.proxy_url;
            width = url.width;
            height = url.height;
            url = url.url;
        }
        this.setImageURL(url);
        this.setImageProxyURL(proxyURL);
        this.setImageWidth(width);
        this.setImageHeight(height);
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} url */
    setImageURL(url) {
        if (typeof url !== "string") throw new EmbedHelperError("Embed image urls should be type of string.");
        if (!this.data.image) this.data.image = {};
        this.data.image.url = url;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string | undefined} proxyURL */
    setImageProxyURL(proxyURL) {
        if (proxyURL !== undefined && typeof proxyURL !== "string") throw new EmbedHelperError("Embed image proxy urls should be type of string.");
        if (!this.data.image) this.data.image = {};
        this.data.image.proxy_url = proxyURL;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {number | undefined} width */
    setImageWidth(width) {
        if (width !== undefined && typeof width !== "number") throw new EmbedHelperError("Embed image widths should be type of number.");
        if (!this.data.image) this.data.image = {};
        this.data.image.width = width;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {number | undefined} height */
    setImageHeight(height) {
        if (height !== undefined && typeof height !== "number") throw new EmbedHelperError("Embed image heights should be type of number.");
        if (!this.data.image) this.data.image = {};
        this.data.image.height = height;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /**
     * @param {string | {url: string, proxyURL?: string, proxy_url?: string, width?: number, height?: number}} url
     * @param {string?} proxyURL
     * @param {number?} width
     * @param {number?} height
     */
    setThumbnail(url, proxyURL, width, height) {
        if (typeof url === "object") {
            proxyURL = url.proxyURL || url.proxy_url;
            width = url.width;
            height = url.height;
            url = url.url;
        }
        this.setThumbnailURL(url);
        this.setThumbnailProxyURL(proxyURL);
        this.setThumbnailWidth(width);
        this.setThumbnailHeight(height);
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} url */
    setThumbnailURL(url) {
        if (typeof url !== "string") throw new EmbedHelperError("Embed image urls should be type of string.");
        if (!this.data.thumbnail) this.data.thumbnail = {};
        this.data.thumbnail.url = url;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string | undefined} proxyURL */
    setThumbnailProxyURL(proxyURL) {
        if (proxyURL !== undefined && typeof proxyURL !== "string") throw new EmbedHelperError("Embed image proxy urls should be type of string.");
        if (!this.data.thumbnail) this.data.thumbnail = {};
        this.data.thumbnail.proxy_url = proxyURL;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {number | undefined} width */
    setThumbnailWidth(width) {
        if (width !== undefined && typeof width !== "number") throw new EmbedHelperError("Embed image widths should be type of number.");
        if (!this.data.thumbnail) this.data.thumbnail = {};
        this.data.thumbnail.width = width;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {number | undefined} height */
    setThumbnailHeight(height) {
        if (height !== undefined && typeof height !== "number") throw new EmbedHelperError("Embed image heights should be type of number.");
        if (!this.data.thumbnail) this.data.thumbnail = {};
        this.data.thumbnail.height = height;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /**
     * @param {string | {name: string, url?: string}} name
     * @param {string?} url
     */
    setProvider(name, url) {
        if (typeof name === "object") {
            url = name.url;
            name = name.name;
        }
        this.setProviderName(name);
        this.setProviderURL(url);
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} name */
    setProviderName(name) {
        if (name !== undefined && typeof name !== "string") throw new EmbedHelperError("Embed provider names should be type of string.");
        if (!this.data.provider) this.data.provider = {};
        this.data.provider.name = name;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} url */
    setProviderURL(url) {
        if (url !== undefined && typeof url !== "string") throw new EmbedHelperError("Embed provider urls should be type of string.");
        if (!this.data.provider) this.data.provider = {};
        this.data.provider.url = url;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /**
     * @param {string | {name: string, url?: string, iconURL?: string, icon_url?: string, proxyIconURL?: string, proxy_icon_url?: string}} name
     * @param {string?} url
     * @param {string?} iconURL
     * @param {string?} proxyIconURL
     */
    setAuthor(name, url, iconURL, proxyIconURL) {
        if (typeof name === "object") {
            url = name.url;
            iconURL = name.iconURL || name.icon_url;
            proxyIconURL = name.proxyIconURL || name.proxy_icon_url;
            name = name.name;
        }
        this.setAuthorName(name);
        this.setAuthorURL(url);
        this.setAuthorIconURL(iconURL);
        this.setAuthorProxyIconURL(proxyIconURL);
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} name */
    setAuthorName(name) {
        if (name !== undefined && typeof name !== "string") throw new EmbedHelperError("Embed author names should be type of string.");
        if ((name || "").length > 256) throw new EmbedHelperError("Embed author names should not be longer than 256 characters.");
        if (!this.data.author) this.data.author = {};
        this.data.author.name = name;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} url */
    setAuthorURL(url) {
        if (url !== undefined && typeof url !== "string") throw new EmbedHelperError("Embed author urls should be type of string.");
        if (!this.data.author) this.data.author = {};
        this.data.author.url = url;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} iconURL */
    setAuthorIconURL(iconURL) {
        if (iconURL !== undefined && typeof iconURL !== "string") throw new EmbedHelperError("Embed author icon urls should be type of string.");
        if (!this.data.author) this.data.author = {};
        this.data.author.icon_url = iconURL;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {string} proxyIconURL */
    setAuthorProxyIconURL(proxyIconURL) {
        if (proxyIconURL !== undefined && typeof proxyIconURL !== "string") throw new EmbedHelperError("Embed author proxy icon urls should be type of string.");
        if (!this.data.author) this.data.author = {};
        this.data.author.proxy_icon_url = proxyIconURL;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /**
     * @param {string | {name: string, value: string, inline?: boolean}} name
     * @param {string?} value
     * @param {boolean?} inline
     */
    addField(name, value, inline) {
        if (typeof name === "object") {
            value = name.value;
            inline = name.inline;
            name = name.name;
        }
        this.setField((this.data.fields || []).length, name, value, inline);
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {{name: string, value: string, inline?: boolean}[]} fields */
    addFields(fields) {
        if (Array.isArray(fields)) for (let i = 0; i < fields.length; i++) this.addField(fields[i]);
        else throw new EmbedHelperError("Embed fields should be type of array.");
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    }

    /**
     * @param {number} index
     * @param {string | {name: string, value: string, inline?: boolean}} name
     * @param {string?} value
     * @param {boolean?} inline
     */
    setField(index, name, value, inline = false) {
        if (typeof name === "object") {
            value = name.value;
            inline = name.inline;
            name = name.name;
        }
        inline = inline === undefined ? false : inline;
        if (typeof index !== "number") throw new EmbedHelperError("Embed field indexes should be type of number.");
        if (Math.floor(index) !== index) throw new EmbedHelperError("Embed field indexes should not be floating point numbers.");
        if (typeof name !== "string") throw new EmbedHelperError("Embed field names should be type of string.");
        if (name.length > 256) throw new EmbedHelperError("Embed field names should not be longer than 256 characters.");
        if (typeof value !== "string") throw new EmbedHelperError("Embed field values should be type of string.");
        if (name.length > 1024) throw new EmbedHelperError("Embed field values should not be longer than 1024 characters.");
        if (typeof inline !== "boolean") throw new EmbedHelperError("Embed field inlines should be type of boolean.");
        if (!this.data.fields) this.data.fields = [];
        if (index > this.data.fields.length) index = this.data.fields.length;
        this.data.fields[index].name = name;
        this.data.fields[index].value = value;
        this.data.fields[index].inline = inline;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    /*** @param {{name: string, value: string, inline?: boolean}[]} fields */
    setFields(fields) {
        if (!Array.isArray(fields)) throw new EmbedHelperError("Embed fields should be type of array.");
        if (fields.some(field => typeof field !== "object")) throw new EmbedHelperError("Embed fields' elements should be type of object.");
        if (fields.some(field => typeof field.name !== "string")) throw new EmbedHelperError("Embed fields' elements' names should be type of string.");
        if (fields.some(field => field.name.length > 256)) throw new EmbedHelperError("Embed fields' elements' names should not be longer than 256 characters.");
        if (fields.some(field => typeof field.value !== "string")) throw new EmbedHelperError("Embed fields' elements' values should be type of string.");
        if (fields.some(field => field.value.length > 1024)) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 1024 characters.");
        if (fields.some(field => field.inline !== undefined && typeof field.inline !== "boolean")) throw new EmbedHelperError("Embed fields' elements' inlines should be type of boolean.");
        fields.forEach(field => field.inline === undefined && (field.inline = false));
        this.data.fields = fields;
        if (this.characterAmount > 6000) throw new EmbedHelperError("Embed fields' elements' values should not be longer than 6000 characters.");
    };

    get characterAmount() {
        return [this.data.title, this.data.description, this.data.footer.text, this.data.author.name, ...(this.data.fields || []).map(i => i.name)].reduce((a, b) => a.length + b.length, 0);
    };
}

class WhiteListHelperType {
    /**
     * @param {GuildMember} member
     * @param {BaseChannel?} channel
     * @returns {boolean}
     */
    check(member, channel) {
        return true;
    };
}

class WhiteListHelper {
    static Roles = class RoleWhiteListHelperType extends WhiteListHelperType {
        /*** @param {Role | string} roles */
        constructor(...roles) {
            super();
            this.roles = roles.map(i => i instanceof Role ? i.id : i);
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return this.roles.every(role => member.roles.cache.has(role));
        };
    };
    static Permissions = class PermissionsWhiteListHelperType extends WhiteListHelperType {
        /*** @param {"CreateInstantInvite" | "KickMembers" | "BanMembers" | "Administrator" | "ManageChannels" | "ManageGuild" | "AddReactions" | "ViewAuditLog" | "PrioritySpeaker" | "Stream" | "ViewChannel" | "SendMessages" | "SendTTSMessages" | "ManageMessages" | "EmbedLinks" | "AttachFiles" | "ReadMessageHistory" | "MentionEveryone" | "UseExternalEmojis" | "ViewGuildInsights" | "Connect" | "Speak" | "MuteMembers" | "DeafenMembers" | "MoveMembers" | "UseVAD" | "ChangeNickname" | "ManageNicknames" | "ManageRoles" | "ManageWebhooks" | "ManageEmojisAndStickers" | "UseApplicationCommands" | "RequestToSpeak" | "ManageEvents" | "ManageThreads" | "CreatePublicThreads" | "CreatePrivateThreads" | "UseExternalStickers" | "SendMessagesInThreads" | "UseEmbeddedActivities" | "ModerateMembers" | bigint} permissions */
        constructor(...permissions) {
            super();
            /*** @type {bigint[]} */
            this.permissions = permissions.map(i => typeof i === "string" ? PermissionsBitField.Flags[i] : i);
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return member.permissions.has(this.permissions);
        };
    };
    static Channels = class ChannelsWhiteListHelperType extends WhiteListHelperType {
        /*** @param {BaseChannel | string} channels */
        constructor(...channels) {
            super();
            this.channels = channels.map(i => i instanceof BaseChannel ? i.id : i);
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return this.channels.includes(channel.id);
        };
    };
    static Users = class UsersWhiteListHelperType extends WhiteListHelperType {
        /*** @param {User | string} users */
        constructor(...users) {
            super();
            this.users = users.map(i => i instanceof User ? i.id : i);
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return this.users.includes(member.id);
        };
    };
    static Custom = class CustomWhiteListHelperType extends WhiteListHelperType {
        /*** @param {function(GuildMember, BaseChannel?): boolean} callback */
        constructor(callback) {
            super();
            this.callback = callback;
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return this.callback(member, channel);
        };
    };

    /*** @param {WhiteListHelperType} whitelists */
    constructor(...whitelists) {
        this.whitelists = whitelists;
    };

    /**
     * @param {GuildMember} member
     * @param {BaseChannel?} channel
     * @returns {boolean}
     */
    check(member, channel) {
        return this.whitelists.every(whitelist => whitelist.check(member, channel));
    };
}

class BlackListHelperType {
    /**
     * @param {GuildMember} member
     * @param {BaseChannel?} channel
     * @returns {boolean}
     */
    check(member, channel) {
        return true;
    }
}

class BlackListHelper {
    static Roles = class RoleBlackListHelperType extends BlackListHelperType {
        /*** @param {Role | string} roles */
        constructor(...roles) {
            super();
            this.roles = roles.map(i => i instanceof Role ? i.id : i);
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return this.roles.some(role => member.roles.cache.has(role));
        };
    };
    static Permissions = class PermissionsBlackListHelperType extends BlackListHelperType {
        /*** @param {"CreateInstantInvite" | "KickMembers" | "BanMembers" | "Administrator" | "ManageChannels" | "ManageGuild" | "AddReactions" | "ViewAuditLog" | "PrioritySpeaker" | "Stream" | "ViewChannel" | "SendMessages" | "SendTTSMessages" | "ManageMessages" | "EmbedLinks" | "AttachFiles" | "ReadMessageHistory" | "MentionEveryone" | "UseExternalEmojis" | "ViewGuildInsights" | "Connect" | "Speak" | "MuteMembers" | "DeafenMembers" | "MoveMembers" | "UseVAD" | "ChangeNickname" | "ManageNicknames" | "ManageRoles" | "ManageWebhooks" | "ManageEmojisAndStickers" | "UseApplicationCommands" | "RequestToSpeak" | "ManageEvents" | "ManageThreads" | "CreatePublicThreads" | "CreatePrivateThreads" | "UseExternalStickers" | "SendMessagesInThreads" | "UseEmbeddedActivities" | "ModerateMembers" | bigint} permissions */
        constructor(...permissions) {
            super();
            /*** @type {bigint[]} */
            this.permissions = permissions.map(i => typeof i === "string" ? PermissionsBitField.Flags[i] : i);
        }

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return !member.permissions.has(this.permissions);
        };
    };
    static Channels = class ChannelsBlackListHelperType extends BlackListHelperType {
        /*** @param {BaseChannel | string} channels */
        constructor(...channels) {
            super();
            this.channels = channels.map(i => i instanceof BaseChannel ? i.id : i);
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return !this.channels.includes(channel.id);
        };
    };
    static Users = class UsersBlackListHelperType extends BlackListHelperType {
        /*** @param {User | string} users */
        constructor(...users) {
            super();
            this.users = users.map(i => i instanceof User ? i.id : i);
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return !this.users.includes(member.id);
        };
    };
    static Custom = class CustomBlackListHelperType extends BlackListHelperType {
        /*** @param {function(GuildMember, BaseChannel?): boolean} callback */
        constructor(callback) {
            super();
            this.callback = callback;
        };

        /**
         * @param {GuildMember} member
         * @param {BaseChannel?} channel
         * @returns {boolean}
         */
        check(member, channel) {
            return !this.callback(member, channel);
        };
    };

    /*** @param {BlackListHelperType} blacklists */
    constructor(...blacklists) {
        this.blacklists = blacklists;
    };

    /**
     * @param {GuildMember} member
     * @param {BaseChannel?} channel
     * @param {boolean} sendMessage
     * @returns {boolean}
     */
    check(member, channel, sendMessage = true) {
        return !this.blacklists.some(blacklist => blacklist.check(member, channel));
    };
}

class CooldownHelper {
    /*** @type {Map<*, number>} */
    cooldowns = new Map();

    /**
     * @param {*} key
     * @param {number} cooldown
     */
    set(key, cooldown) {
        this.cooldowns.set(key, Date.now() + cooldown);
    };

    /**
     * @param {*} key
     * @param {number} cooldown
     */
    add(key, cooldown) {
        this.cooldowns.set(key, (this.cooldowns.get(key) || Date.now()) + cooldown);
    };

    /**
     * @param {*} key
     * @returns {boolean}
     */
    has(key) {
        return this.cooldowns.get(key) > Date.now();
    };

    /*** @param {*} key */
    delete(key) {
        this.cooldowns.delete(key);
    };

    /**
     * @param {*} key
     * @param {number} cooldown
     * @returns {boolean}
     */
    auto(key, cooldown) {
        if (this.has(key)) return false;
        this.set(key, cooldown);
        return true;
    };
}

const EMPTY_CALLBACK = () => {
};

class AsyncLoopError extends Error {
};

class AsyncLoop {
    /**
     * @param {function(number): boolean} statement
     * @param {function(number): void} callback
     * @param {function(number): void} endCallback
     * @param {number} ms
     * @return {Promise<void>}
     */
    static async startWhile({
                                statement, callback = EMPTY_CALLBACK, endCallback = EMPTY_CALLBACK, ms = 0
                            } = {}) {
        if (typeof statement !== "function") throw new AsyncLoopError("Statement should have been a function which returns boolean. (statement)");
        if (typeof callback !== "function") throw new AsyncLoopError("Callback should have been a function. (callback)");
        if (typeof endCallback !== "function") throw new AsyncLoopError("End callback should have been a function. (endCallback)");
        return await new Promise(r => {
            let i = 0;
            const rep = repeat(async () => {
                if (statement(i)) callback(i);
                else {
                    rep.stop();
                    endCallback(i);
                    r();
                }
                i++;
            }, ms);
        });
    };

    /**
     * @param {number} iterations
     * @param {function(number): void} callback
     * @param {function(number): void} endCallback
     * @param {number} ms
     * @return {Promise<void>}
     */
    static async repeat({
                            iterations, callback = EMPTY_CALLBACK, endCallback = EMPTY_CALLBACK, ms = 0
                        } = {}) {
        if (typeof iterations !== "number") throw new AsyncLoopError("Iteration amount should have been a number. (iterations)");
        return await AsyncLoop.startWhile({
            statement: i => i < iterations,
            callback, endCallback, ms
        });
    };
}

class RepeatInstance {
    /**
     * @param {function} callback
     * @param {number} ms
     */
    constructor(callback, ms) {
        this.callback = callback;
        this.ms = ms;
        this.cancelled = true;
        const l = async () => {
            if (this.cancelled) return;
            await this.callback();
            setTimeout(l, this.ms);
        };
    };

    /*** @return {void} */
    stop() {
        this.cancelled = true;
    };
}

/**
 * @param {function} callback
 * @param {number} ms
 */
function repeat(callback, ms) {
    return new RepeatInstance(callback, ms);
}

global.ButtonHelper = ButtonHelper;
global.ReactionHelper = ReactionHelper;
global.ModalHelper = ModalHelper;
global.EmbedHelper = EmbedHelper;
global.WhiteListHelper = WhiteListHelper;
global.BlackListHelper = BlackListHelper;
global.CooldownHelper = new CooldownHelper();
global.AsyncLoop = AsyncLoop;
global.repeat = repeat;
global.wait = ms => new Promise(r => setTimeout(r, ms));
client.on("interactionCreate", interaction => {
    if (interaction instanceof ButtonInteraction) ButtonHelper.registered.filter(b => b[0] === interaction.customId).forEach(i => i[1](interaction));
    if (interaction instanceof ModalSubmitInteraction) ModalHelper.registered.filter(m => m[0] === interaction.customId).forEach(i => i[1](interaction));
});
client.on("messageReactionAdd", (reaction, user) => ReactionHelper.registered.filter(EMPTY_CALLBACK[0].id === reaction.message.id && r[1].id === reaction.id).forEach(i => i[2](user)));