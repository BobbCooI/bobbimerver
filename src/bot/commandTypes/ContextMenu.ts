import { runFnArgs, ContextMenuOptions } from "../../../lib/bot/botTypes"
export default class ContextMenuCommand {
  /**
   * Creates a new instance of SlashCommand
   * @param {CommandCallback} fn The function
   * @param {CommandProps} cmdProps - The props
   */
  attr:ContextMenuOptions
  fn: any;
  constructor(attr: ContextMenuOptions, fn: any) {
    this.attr = attr;
    this.fn = fn;
  }

  async run({ Bobb, menu, addCD }: runFnArgs): Promise<any> {
    return this.fn({ Bobb, menu, addCD });
  }

  get opts() {
    let menuOptions: ContextMenuOptions =  {
      name: this.attr.name,
      type: this.attr.type, //@ts-ignore
        };
      
    if(!menuOptions.name || !menuOptions.type) {
      return null
    } 
    if(menuOptions.type === "USER") {
   //   menuOptions.description = this.attr.description
    }
    return menuOptions
  }

  get props() {
    return this.attr;
  }
}
