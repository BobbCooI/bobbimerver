import {
	ChatInputCommandInteraction,
	MessageComponentInteraction,
	SelectMenuInteraction
} from 'discord.js';
import { slashInteraction } from '../../../lib/bot/discordThings';
import _ from 'lodash';
import Bobb from '../botClass';
type InteractionTypes = ChatInputCommandInteraction | MessageComponentInteraction | SelectMenuInteraction

exports.handle = async function (interaction: InteractionTypes): Promise<any> {
	//console.log("interaction", interaction, interaction.isMessageComponent(), interaction.isButton(), interaction.isCommand())
	if (interaction.isButton()) {

		if (interaction.customId.includes("Page")) return;
		if (interaction.customId === "pong") {
			await interaction.editReply(`u be roll a ${Math.floor(Math.random() * 6) + 1}`);
		}
	}

	if (interaction.isCommand()) {
		await interaction.deferReply()
		await this.client.channels.fetch(interaction.channelId)
		const message = new slashInteraction(this as Bobb, interaction)
		return await this.handlers.handleSlashCommand.call(this, message)
	} 
}

