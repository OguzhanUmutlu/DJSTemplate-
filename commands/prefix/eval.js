/**
 * @name eval
 * @enabled
 */

const code = args.join(" ");
if (!(new WhiteListHelper.Users("460154149040947211").check(message.member))) return await channel.send("You are not my owner!");
const clean = str => str.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
try {
    await channel.send(`\`\`\`javascript\n${clean(require("util").inspect(eval(code)))}\n\`\`\``);
} catch (err) {
    await channel.send(`\`ERROR\` \`\`\`xl\n${clean(err.stack)}\n\`\`\``);
}