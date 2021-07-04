import SlashCommand from "./SlashCommand";
import { commandAttr } from "../../types/bot";
import { runFnArgs } from "../../types/bot";

export default class GenericCommand {
  attr: commandAttr;
  fn: any;
  fnSlash?: any;
  category?: string;
  description?: string;
  /**
   * Creates a new instance of GenericCommand
   * @param {CommandCallback} fn The function
   * @param {CommandProps} cmdProps - The props
   */
  constructor(attr: commandAttr, fn: any, fnSlash?: any) {
    this.attr = attr;
    this.fn = fn;
    if (this.fnSlash || (this.props.slashCmd || this.props.slashOpts)) this.fnSlash = new SlashCommand(this.props, fnSlash);
  }
  // set this to an attr in a generic command ig
  async run({ Bobb, message, argManager, addCD }: runFnArgs) {
    /*  if (this.props.missingArgs && !args[0]) {
      return this.props.missingArgs;
    }
    if (this.props.minArgs && args.length < this.props.minArgs) {
      return this.props.missingArgs;
    }*/

    // Here can be middleware code such as args length checking ex. above ^

    return this.fn({ Bobb, message, argManager, addCD });
  }
  get props() {
    return Object.assign(
      {
        usage: "{command}",
        cooldown: 2000,
        donorCD: 500,
        isNSFW: false,
        ownerOnly: false,
        dmOnly: false,
        bypass: false,
        slashCmd: false,
        cooldownMessage: "chill ur beans for "
      },
      this.attr,
      { perms: ["SEND_MESSAGES"].concat(this.attr.perms || []) }
    );
  }
}
