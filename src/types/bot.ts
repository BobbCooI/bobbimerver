import { Collection, Message, MessageEmbed, MessageReaction, User, MessageButton, MessageButtonOptions, MessageActionRow, MessageActionRowComponentResolvable, CommandInteraction, CommandInteractionOption } from 'discord.js';
import Bobb from '../bot/botClass';
import _ from 'lodash';
import ArgManager from "../utils/argsManager";
export interface commandAttr {
  triggers: Array<string>;
  usage: string;
  description: string;
  minArgs?: number;
  maxArgs?: number;
  missingArgs?: string; // missing args string message
  slashCmd?: boolean;
  dmOnly?: boolean;
  slashOpts?: {
    name: string;
    description: string;
    options?: Array<{
      type: number;
      name: string;
      description: string;
      required: boolean;
    }> /*[{type: 3,
    name: 'episodes',
    description: 'Usage: 1-2 | 1,2 | latest', required: true}]*/
  };
  bypass?: boolean;
  cooldown?: number;
  category?: string;
  perms?: any;
  ownerOnly?: boolean;
}

export interface runFnArgs {
  Bobb?: Bobb;
  message?: Message;
  interaction?: CommandInteraction;
  argslash?: Collection<string, CommandInteractionOption>;
  argManager?: ArgManager;
  addCD?: any;
}
/*export interface runFnMessageArgs extends runFnArgs {
  args: string[]
}
export interface runFnInteractionArgs extends runFnArgs{
  args: APIApplicationCommandInteractionDataOption[];
}*/
export type mOrI = "interaction" | "message"
export interface retOptions {
  readonly Paginate?: boolean;
  readonly ephemeral?: boolean;
}
export class Return {
  embeds?: Array<MessageEmbed>
  content?: string;
  file?: any;
  components?: Array<MessageActionRow>;
  readonly type: mOrI;

  readonly Paginate?: boolean;
  readonly ephemeral?: boolean;

  constructor(type: mOrI, options: retOptions = {}) {
    this.type = type;
    options.Paginate ? this.Paginate = options.Paginate : this.Paginate = false;
    options.ephemeral ? this.ephemeral = true : this.ephemeral = false;
  }
  setEmbeds(embeds: Array<MessageEmbed>) {
    embeds = embeds.map((em: MessageEmbed) => em.setColor(this.randomColor()))
    this.embeds = embeds;
    return this;
  }

  randomColor() {
    return Math.floor(Math.random() * 0xffffff);
  }
  setContent(cont: string) {
    this.content = cont;
    return this;
  }
  setComponents(comps: Array<MessageActionRowComponentResolvable>) {
    // pretty much middleware
    if (!this.components) this.components = [
      new MessageActionRow()
    ]
    this.components[0]!.addComponents(comps);
    return this;
  }
  setButtons(btnOpts: Array<MessageButtonOptions>) {
    let btns = btnOpts.map(btn => new MessageButton(btn))

    // How many action rows there needs to be
    const btnGroupRows = Math.ceil(btns.length / 5)

    if (btns.length > 0 && btns.length < 25) {
      // Fills the array with MessageActionRows according to how many buttons there are (5 buttons per row)
      this.components = new Array(btnGroupRows).fill(null);

    } else throw `invalid number of buttons (${btns.length})`;
    const btnGroups = _.chunk(btns, 5)
    this.components = this.components.map((_mar, ind) => new MessageActionRow({ components: btnGroups[ind] }))

    return this;
  }
  Paginator(message: Message, footer: string): any {
    if (!this.embeds || !this.embeds.length || this.embeds.length == 0) return;
    if (this.type == "message") {
      if (this.embeds.length == 1) return message.channel.send({ embeds: [this.embeds[0]] });
      let person = message.author;
      let currentPage = 0;
      let firstEmbed = this.embeds[currentPage].setFooter(
        `${footer} | Page ${currentPage + 1}/${this.embeds.length}`,
        person.displayAvatarURL({ format: "png", dynamic: true }))

      message.channel.send({ embeds: [firstEmbed] }).then(message => {
        message.react("⏪");
        message.react("◀️");
        message.react("▶️");
        message.react("⏩");
        const filter = (reaction: MessageReaction, user: User) =>
          ["⏪", "◀️", "▶️", "⏩"].includes(reaction.emoji.name!) &&
          user.id === person.id;
        const collector = message.createReactionCollector({
          filter,
          time: 10000000
        });
        collector.on("collect", (reaction: MessageReaction) => {
          if (reaction.emoji!.name === "▶️") {
            if (currentPage < this.embeds!.length - 1) {
              currentPage++;
              const newMan = this.embeds?.[currentPage]!.setFooter(
                `${footer} | Page ${currentPage + 1}/${this.embeds?.length}`,
                person.displayAvatarURL({ format: "png", dynamic: true })
              );
              message.edit({ embeds: [newMan!] });
            }
          } else if (reaction.emoji!.name === "◀️") {
            if (currentPage !== 0) {
              currentPage--;
              const newMan = this.embeds?.[currentPage]!.setFooter(
                `${footer} | Page ${currentPage + 1}/${this.embeds?.length}`,
                person.displayAvatarURL({ format: "png", dynamic: true })
              );
              message.edit({ embeds: [newMan!] });
            }
          } else if (reaction.emoji!.name === "⏪") {
            currentPage = 0;
            const newMan = this.embeds?.[currentPage]!.setFooter(
              `${footer} | Page 1/${this.embeds?.length}`,
              person.displayAvatarURL({ format: "png", dynamic: true })
            );
            message.edit({ embeds: [newMan!] });
          } else if (reaction.emoji!.name === "⏩") {
            currentPage = this.embeds!.length - 1;
            const newMan = this.embeds?.[currentPage]!.setFooter(
              `${footer} | Page ${this.embeds?.length}/${this.embeds?.length}`,
              person.displayAvatarURL({ format: "png", dynamic: true })
            );
            message.edit({ embeds: [newMan!] });
          }
        }); //collector On
      });
    }
    return this;
  }
}