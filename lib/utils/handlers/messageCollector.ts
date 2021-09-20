
export default class MessageCollector {
  bot: any;
  collectors: {
    [index: string]: any;
  }
  constructor(bot: any) {
    this.collectors = {};
    bot.on('message', this.verify.bind(this));
  }

  async verify(msg: any) {
    const collector = this.collectors[msg.channel.id + msg.author.id];
    if (collector && collector.filter(msg)) {
      collector.resolve(msg);
    }
  }

  awaitMessage(channelID: string, userID: string, timeout: number, filter = () => true) {
    return new Promise(resolve => {
      if (this.collectors[channelID + userID]) {
        delete this.collectors[channelID + userID];
      }

      this.collectors[channelID + userID] = { resolve, filter };

      setTimeout(resolve.bind(null, false), timeout);
    });
  }
};