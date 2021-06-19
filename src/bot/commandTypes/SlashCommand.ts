import {commandAttr} from "../../types/bot";
import { runFnArgs } from "../../types/bot";

export default class SlashCommand {
  /**
   * Creates a new instance of SlashCommand
   * @param {CommandCallback} fn The function
   * @param {CommandProps} cmdProps - The props
   */
  attr: commandAttr;
  fn: any;
  constructor(attr: commandAttr, fn: any) {
    this.attr = attr;
    this.fn = fn;
  }

  async run({ Bobb, interaction, argslash, addCD }: runFnArgs): Promise<any> {
    return this.fn({ Bobb, interaction, argslash, addCD });
  }

  get props() {
    return this.attr;
  }
}
