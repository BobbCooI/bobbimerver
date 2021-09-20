import {
  Collection,
  Message,
  MessageEmbed,
  MessageOptions,
  MessageButton,
  MessageButtonOptions,
  MessageActionRow,
  MessageActionRowComponentResolvable,
  CommandInteraction,
  CommandInteractionOption,
  ApplicationCommandType,
  ContextMenuInteraction,
  MessageComponentInteraction
} from 'discord.js';
import Bobb from '../../src/bot/botClass';
import _ from 'lodash';
import { Swessage } from './discordExtensions';
import {
  ArgumentGenerator as AkairoArgumentGenerator,
  ArgumentOptions as AkairoArgumentOptions,
  Flag,
} from "discord-akairo";

export type ContextMenuOptions = {
  name: string,
  type: ApplicationCommandType
}
export interface runFnArgs {
  Bobb?: Bobb;
  addCD?: any;
  // for discord messages
  message?: Message;

  // for discord interactions
  interaction?: CommandInteraction;
  argslash?: Collection<string, CommandInteractionOption>;
  menu?: ContextMenuInteraction;
}
export interface executeArgs {
  Swessage: Swessage;
  addCD?: () => any
}
export type ArgumentGenerator = (
  ...a: Parameters<AkairoArgumentGenerator>
) => IterableIterator<ArgumentOptions | Flag>;

export interface ArgumentOptions extends AkairoArgumentOptions {
  description?: string;
  slashCommandOptions?: Array<string>;
  slashCommandType?: string;
  readableType?: string;
  required?: boolean;
}

export type getArguments = Collection<string, string>;


export interface resolveMessageOpts {
  noEmbeds?: boolean;
  noContent?: boolean;
  noComponents?: boolean;
  ephemeral?: boolean;
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
  Bobb: Bobb;
  readonly Paginate?: boolean;
  readonly ephemeral?: boolean;

  constructor(Bobb: Bobb, options: retOptions = {}) {
    this.Bobb = Bobb
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
    return btns;
  }

  async modernPaginate(message: Swessage, footer: string) {
    //if (!msg && !msg.channel) throw new Error("Channel is inaccessible.");
    if (!this.Paginate) return;
    if (!this.embeds || !this.embeds.length || this.embeds.length == 0) throw new Error("Pages are not given.");
    if (this.embeds.length == 1) return message.send(<MessageOptions>this);
    let buttonList: MessageButton[] = this.setButtons([
      {
        label: "",
        emoji: "<:firstPage:883181509408866324>",
        style: "PRIMARY",
        customId: "firstPage",
        disabled: true
      },
      {
        label: "",
        emoji: "<:previousPage:883181795716255746>",
        style: "PRIMARY",
        customId: "previousPage",
        disabled: true
      },
      {
        label: "",
        emoji: "<:nextPage:883181957264048148>",
        style: "PRIMARY",
        customId: "nextPage"
      },
      {
        label: "",
        emoji: "<:lastPage:883182068517965874>",
        style: "PRIMARY",
        customId: "lastPage"
      }
    ])


    if (buttonList[0].style === "LINK" || buttonList[1].style === "LINK" || buttonList[2].style === "LINK" || buttonList[3].style === "LINK")
      throw new Error(
        "Link buttons are not supported with discordjs-button-pagination"
      );

    let page = 0;

    let row = new MessageActionRow().addComponents(buttonList);
    //  console.log(message)
    const curPage = await message.send({
      embeds: [this.embeds[page].setFooter(`${footer ? footer + " | " : ""}Page ${page + 1} / ${this.embeds.length}`)],
      components: [row]
    });

    const filter = (i: MessageComponentInteraction) =>
      i.customId === buttonList[0].customId || // firstPage
      i.customId === buttonList[1].customId || // previousPage
      i.customId === buttonList[2].customId || // nextPage
      i.customId === buttonList[3].customId;   // lastPage

    const collector = await curPage.createMessageComponentCollector({
      filter,
      time: 1000 * 45,
    });
    collector.on("collect", async (i) => {
      switch (i.customId) {
        case buttonList[0].customId:
          page = 0
          break;
        case buttonList[1].customId:
          page = page > 0 ? --page : this.embeds!.length - 1;
          break;
        case buttonList[2].customId:
          page = page + 1 < this.embeds!.length ? ++page : 0;
          break;
        case buttonList[3].customId:
          page = this.embeds!.length - 1
          break;
        default:
          break;
      }

      row = new MessageActionRow().addComponents(
        page == 0 ? buttonList[0].setDisabled(true) : buttonList[0].setDisabled(false),
        page > 0 ? buttonList[1].setDisabled(false) : buttonList[1].setDisabled(true),
        page < this.embeds!.length - 1 ? buttonList[2].setDisabled(false) : buttonList[2].setDisabled(true),
        page > 0 && this.embeds!.length - 1 == page ? buttonList[3].setDisabled(true) : buttonList[3].setDisabled(false)
      );
      await i.update({
        embeds: [this.embeds![page].setFooter(`${footer ? footer + " | " : ""}Page ${page + 1} / ${this.embeds!.length}`)],
        components: [row],
      });
      //  await i.reply("a")
      collector.resetTimer();
    });

    collector.on("end", () => {
      if (!curPage.deleted) {
        const disabledRow = new MessageActionRow().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true),
          buttonList[2].setDisabled(true),
          buttonList[3].setDisabled(true)
        );

        curPage.edit({
          embeds: [this.embeds![page].setFooter(`${footer ? footer + " | " : ""}Page ${page + 1} / ${this.embeds!.length}`)],
          components: [disabledRow],
        });
      }
    });

    return this;
  }
  resolvedMessageOpts(options?: resolveMessageOpts): MessageOptions {
    const ret: any = {}
    if (this.embeds && !options?.noEmbeds) ret.embeds = this.embeds
    if (this.components && !options?.noComponents) ret.components = this.components;
    if (this.content && !options?.noContent) ret.content = this.content;
    if (this.ephemeral && !options?.ephemeral) ret.ephemeral = this.ephemeral;
    return ret;
  }
}