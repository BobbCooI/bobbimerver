import {
	CommandInteraction,
	MessageComponentInteraction,
	SelectMenuInteraction
} from 'discord.js';
import { slashMessage } from '../../../lib/bot/discordExtensions';
import _ from 'lodash';
type InteractionTypes = CommandInteraction | MessageComponentInteraction | SelectMenuInteraction

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
		const message = new slashMessage(this, interaction, "interaction")
		return await this.handlers.handleSlashCommand.call(this, message)
	} else if (interaction.isContextMenu()) {
		return await this.handlers.handleContextMenu.call(this, interaction)
	}
}

