import Bobb from "@src/bot/botClass";
import {
  Message,
  WebhookEditMessageOptions,
  ChatInputCommandInteraction,
  MessageComponentInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  InteractionReplyOptions,
  ButtonStyle,
  APIButtonComponentWithCustomId,
  ComponentType
} from "discord.js";
import { Command } from "./Command";
import _ from 'lodash';

// each command uses this
export type executeArgs = {
  slashInt: slashInteraction,
   addCD?: () => any
}

export interface resolveMessageOpts {
  noEmbeds?: boolean;
  noContent?: boolean;
  noComponents?: boolean;
  ephemeral?: boolean;
}

export interface retOptions {
  readonly Paginate?: boolean;
  readonly ephemeral?: boolean;
}

export class Return {
  embeds?: Array<EmbedBuilder>
  content?: string;
  file?: any;
  components?: Array<ActionRowBuilder<ButtonBuilder>>;
  Bobb: Bobb;
  readonly Paginate?: boolean;
  readonly ephemeral?: boolean;

  constructor(Bobb: Bobb, options: retOptions = {}) {
    this.Bobb = Bobb
    options.Paginate ? this.Paginate = options.Paginate : this.Paginate = false;
    options.ephemeral ? this.ephemeral = true : this.ephemeral = false;
  }
  setEmbeds(embeds: Array<EmbedBuilder>) {
    embeds = embeds.map((em: EmbedBuilder) => em.setColor(this.randomColor()))
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
  setComponents(comps: Array<ButtonBuilder>) {
    // pretty much middleware
    if (!this.components) this.components = [
      new ActionRowBuilder<ButtonBuilder>()
    ]
    this.components[0]!.addComponents(comps);
    return this;
  }
  setButtons(btnOpts: Array<APIButtonComponentWithCustomId>): Array<ButtonBuilder> {
    let btns = btnOpts.map(btn => new ButtonBuilder(btn))

    // How many action rows there needs to be
    const btnGroupRows = Math.ceil(btns.length / 5)

    if (btns.length > 0 && btns.length < 25) {
      // Fills the array with MessageActionRows according to how many buttons there are (5 buttons per row)
      this.components = new Array(btnGroupRows).fill(null);

    } else throw `invalid number of buttons (${btns.length})`;
    const btnGroups = _.chunk(btns, 5)

    this.components = this.components.map((_mar, ind) => new ActionRowBuilder<ButtonBuilder>({ components: btnGroups[ind] }))
    return btns;
  }

  async modernPaginate(message: slashInteraction, footer: string) {
    //if (!msg && !msg.channel) throw new Error("Channel is inaccessible.");
    if (!this.Paginate) return;
    if (!this.embeds || !this.embeds.length || this.embeds.length == 0) throw new Error("Pages are not given.");
    if (this.embeds.length == 1) return message.send(<InteractionReplyOptions>this);
    let buttonList: Array<ButtonBuilder> = this.setButtons([
      {
        label: "",
        emoji: {
          name: "firstPage",
          id: "883181509408866324"
        },
        style: ButtonStyle.Primary,
        custom_id: "firstPage",
        disabled: true,
        type: ComponentType.Button
      },
      {
        label: "",
        emoji: {
          name: "previousPage",
          id: "883181795716255746"
        },
        style: ButtonStyle.Primary,
        custom_id: "previousPage",
        disabled: true,
        type: ComponentType.Button
      },
      {
        label: "",
        emoji:  {
          name: "nextPage",
          id: "883181957264048148"
        },
        style: ButtonStyle.Primary,
        custom_id: "nextPage",
        type: ComponentType.Button
      },
      {
        label: "",
        emoji: {
          name: "lastPage",
          id: "883182068517965874"
        },
        style: ButtonStyle.Primary,
        custom_id: "lastPage",
        type: ComponentType.Button

      }
    ]);

    let page = 0;

    let row = new ActionRowBuilder<ButtonBuilder>({
      components: buttonList
    })
    //  console.log(message)
    const curPage = await message.send({
      embeds: [this.embeds[page].setFooter({text:`${footer ? footer + " | " : ""}Page ${page + 1} / ${this.embeds.length}`})],
      components: [<any>row]
    });

    const filter = (i: MessageComponentInteraction) =>
      i.customId ===  "firstPage" || // firstPage
      i.customId === "previousPage" || // previousPage
      i.customId === 'nextPage'|| // nextPage
      i.customId ===  "lastPage"   // lastPage

    const collector = await curPage.channel.createMessageComponentCollector({
      filter,
      time: 1000 * 45,
    });
    collector.on("collect", async (i) => {
      switch (i.customId) {
        case "firstPage":
          page = 0
          break;
        case "previousPage":
          page = page > 0 ? --page : this.embeds!.length - 1;
          break;
        case "nextPage":
          page = page + 1 < this.embeds!.length ? ++page : 0;
          break;
        case "lastPage":
          page = this.embeds!.length - 1
          break;
        default:
          break;
      }

      row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        page == 0 ? buttonList[0].setDisabled( true) : buttonList[0].setDisabled(false),
        page > 0 ? buttonList[1].setDisabled(false) : buttonList[1].setDisabled(true),
        page < this.embeds!.length - 1 ? buttonList[2].setDisabled(false): buttonList[2].setDisabled(true),
        page > 0 && this.embeds!.length - 1 == page ? buttonList[3].setDisabled(true) : buttonList[3].setDisabled(false)
      );
      await i.update({
        embeds: [this.embeds![page].setFooter({text: `${footer ? footer + " | " : ""}Page ${page + 1} / ${this.embeds!.length}`})],
        components: [row],
      });
      //  await i.reply("a")
      collector.resetTimer();
    });

    collector.on("end", () => {
      if (!curPage.delete) {
        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          buttonList[0].setDisabled(true),
          buttonList[1].setDisabled(true),
          buttonList[2].setDisabled(true),
          buttonList[3].setDisabled(true)
        );

        curPage.edit({
          embeds: [this.embeds![page].setFooter({text: `${footer ? footer + " | " : ""}Page ${page + 1} / ${this.embeds!.length}`})],
          components: [disabledRow],
        });
      }
    });

    return this;
  }
  resolvedMessageOpts(options?: resolveMessageOpts): InteractionReplyOptions {
    const ret: any = {}
    if (this.embeds && !options?.noEmbeds) ret.embeds = this.embeds
    if (this.components && !options?.noComponents) ret.components = this.components;
    if (this.content && !options?.noContent) ret.content = this.content;
    if (this.ephemeral && !options?.ephemeral) ret.ephemeral = this.ephemeral;
    return ret;
  }
}

export class slashInteraction {
  slash: ChatInputCommandInteraction;
  command: Command;
  Bobb: Bobb;
  declare client: Bobb["client"];

  constructor(Bobb: Bobb, interaction: ChatInputCommandInteraction) {
    this.Bobb = Bobb;
    this.slash = interaction;
    
    this.command = this.Bobb.commandHandler.getCommand(
      interaction
    ) as Command;

    return this;
  }

  //basically middleware
  async send(payload: string | InteractionReplyOptions | WebhookEditMessageOptions): Promise<Message> {  
    return await this.slash.editReply(payload);
  }
}

export function handleRes(res: any, command: Command, commandType: string, message: slashInteraction) {
  if (!res) {
    return;
  }
  if (res instanceof Return) {
    if (res.Paginate) return;

    if (_.isEmpty(res)) throw new Error(`No content to send back for ${commandType}: ${command.name} ?`)
    res = res.resolvedMessageOpts();
  } else if (typeof res == "string") {
    res = { content: res }
  } else {
    throw new Error(`What kind of return for ${command.name}? I received ${res} type ${typeof res}`)
  }
  return message.send(res).catch(console.log)
}
