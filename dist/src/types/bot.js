"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Return = void 0;
const discord_js_1 = require("discord.js");
class Return {
    constructor(type, options = {}) {
        this.type = type;
        options.Paginate ? this.Paginate = options.Paginate : this.Paginate = false;
        options.ephemeral ? this.ephemeral = true : this.ephemeral = false;
    }
    setEmbeds(embeds) {
        embeds = embeds.map((em) => em.setColor(this.randomColor()));
        this.embeds = embeds;
        return this;
    }
    randomColor() {
        return Math.floor(Math.random() * 0xffffff);
    }
    setContent(cont) {
        this.content = cont;
        return this;
    }
    setComponents(comps) {
        if (!this.components)
            this.components = [
                new discord_js_1.MessageActionRow({ type: 1 })
            ];
        this.components[0].addComponents(comps);
        return this;
    }
    Paginator(message, footer) {
        if (!this.embeds || !this.embeds.length || this.embeds.length == 0)
            return;
        if (this.type == "message") {
            if (this.embeds.length == 1)
                return message.channel.send({ embeds: [this.embeds[0]] });
            let person = message.author;
            let currentPage = 0;
            let firstEmbed = this.embeds[currentPage].setFooter(`${footer} | Page ${currentPage + 1}/${this.embeds.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
            message.channel.send({ embeds: [firstEmbed] }).then(message => {
                message.react("⏪");
                message.react("◀️");
                message.react("▶️");
                message.react("⏩");
                const filter = (reaction, user) => ["⏪", "◀️", "▶️", "⏩"].includes(reaction.emoji.name) &&
                    user.id === person.id;
                const collector = message.createReactionCollector(filter, {
                    time: 10000000
                });
                collector.on("collect", (reaction) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
                    if (reaction.emoji.name === "▶️") {
                        if (currentPage < this.embeds.length - 1) {
                            currentPage++;
                            const newMan = (_a = this.embeds) === null || _a === void 0 ? void 0 : _a[currentPage].setFooter(`${footer} | Page ${currentPage + 1}/${(_b = this.embeds) === null || _b === void 0 ? void 0 : _b.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                            message.edit({ embeds: [newMan] });
                        }
                    }
                    else if (reaction.emoji.name === "◀️") {
                        if (currentPage !== 0) {
                            currentPage--;
                            const newMan = (_c = this.embeds) === null || _c === void 0 ? void 0 : _c[currentPage].setFooter(`${footer} | Page ${currentPage + 1}/${(_d = this.embeds) === null || _d === void 0 ? void 0 : _d.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                            message.edit({ embeds: [newMan] });
                        }
                    }
                    else if (reaction.emoji.name === "⏪") {
                        currentPage = 0;
                        const newMan = (_e = this.embeds) === null || _e === void 0 ? void 0 : _e[currentPage].setFooter(`${footer} | Page 1/${(_f = this.embeds) === null || _f === void 0 ? void 0 : _f.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                        message.edit({ embeds: [newMan] });
                    }
                    else if (reaction.emoji.name === "⏩") {
                        currentPage = this.embeds.length - 1;
                        const newMan = (_g = this.embeds) === null || _g === void 0 ? void 0 : _g[currentPage].setFooter(`${footer} | Page ${(_h = this.embeds) === null || _h === void 0 ? void 0 : _h.length}/${(_j = this.embeds) === null || _j === void 0 ? void 0 : _j.length}`, person.displayAvatarURL({ format: "png", dynamic: true }));
                        message.edit({ embeds: [newMan] });
                    }
                });
            });
        }
        return this;
    }
}
exports.Return = Return;
//# sourceMappingURL=bot.js.map