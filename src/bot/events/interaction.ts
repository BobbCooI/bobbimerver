import {Permissions, ButtonInteraction, CommandInteraction, MessageEmbed} from 'discord.js';
import GenericCommand from '../commandTypes/GenericCommand';
import Bobb from '../botClass';
import { Return } from '../../types/bot';
import _ from 'lodash';


exports.handle = async function(interaction:CommandInteraction|ButtonInteraction): Promise<any> {
  		await interaction.defer();
//console.log("interaction", interaction, interaction.isMessageComponent(), interaction.isButton(), interaction.isCommand())
if(interaction.isButton()) {
  if(interaction.customID === "pong") {
   await interaction.editReply(`u be roll a ${Math.floor(Math.random() * 6) + 1}`);
  }
}

if(interaction.isCommand()) {
  console.log(interaction.options, Object.keys(interaction))
	let {commandName} = interaction;
	const args = interaction.options;

	const command =commandName && this.cmds.find(
		(c: GenericCommand) => (c.props?.slashCmd && c.props?.slashOpts?.name?.toLowerCase()) === commandName.toLowerCase()
	);
  
if(!command) return;

	const bypass = command.props.bypass;
	
	if (command.props.dmOnly && !interaction.guildID) return;

	let runner = await this.db.fetchMemberInfo({ discID: interaction.user.id });
	if (!runner && !bypass && !interaction.guildID)
		return interaction.editReply(
			'Please verify in DMs before using commands.'
		);
	let cmdSpam = runner ? runner.spam : 0;
	let latestCmd = runner ? runner.latestCmd : false;

	if (cmdSpam > 10500) {
		try {
			await interaction.editReply({
				content: 'You have been blacklisted from the bot for spamming over 10,000 times. Nice.\nYou can appeal at this link and we will check it within 2 weeks',
      });
		} catch (e) {
			     await this.loggers.log(`User ${interaction.user.username}#${interaction.user.discriminator} (${interaction.user.id}) did not get the appeal DM. Error ${e.message}`);
		}
		return;
	}
	await updateStats.call(this, interaction, command, latestCmd);

	const isInCooldown = await checkCooldowns.call(this, interaction, command);
	if (isInCooldown) {
		return;
	}
	const updateCooldowns = () =>
		this.db.updateCooldowns(
			command?.props?.triggers[0],
			interaction.user.id!
		);
    let permissions:any = new Permissions().add(["SEND_MESSAGES"]);

	if (interaction.guildID) {
		permissions = (await this.client.channels.fetch(
			interaction.channelID
		)).permissionsFor(this.client.user.id);
	}
	if (command.props.perms.some((perm: any) => !permissions.has(perm))) {
		console.log(permissions, command?.props?.perms, 'Error! no perms!');
		// checkPerms.call(this, command, permissions, message);
	}
	let res: any = await command.fnSlash.run({
		Bobb: this,
		interaction,
		argslash: args,
		addCD: updateCooldowns
	});
	if (!res) {
		return;
	}
if(typeof res  === "string") {
  res = {
    content: res
  };
} else if(res instanceof Return) {
  if(res.Paginate) return;
  let obj: any = {
  }
  if(res.content) obj.content = res.content;
  if(res.embeds) obj.embeds = res.embeds;
  if(res.file) obj.file = res.file;
  if(_.isEmpty(obj)) throw new Error(`No content to send back for interaction ${command.props.triggers[0]} ?`)
res = obj;
} else {
  throw new Error(`What kind of return for ${command.props.triggers[0]}?`)
}

	console.log(res);
	await interaction.editReply(res);

}
};

async function checkCooldowns(this: Bobb, interaction: CommandInteraction|ButtonInteraction, command: GenericCommand) {
	const cooldown = await this.db.getSpecificCooldown(
		command.props,
		interaction.user.id
	);
	if (cooldown > Date.now() && process.env.NODE_ENV !== 'dev') {
		const waitTime = (cooldown - Date.now()) / 1000;
		let cooldownWarning =
			command.props.cooldownMessage ||
			`**time left until you can run this command again:** `;

		const cooldownMessage = new MessageEmbed()
				.setColor(this.utils.randomColor())
				.setTitle('chill 😩')
				.setDescription(
					cooldownWarning +
					(waitTime > 60
						? `__${this.utils.parseTime(waitTime)}__`
						: `__${waitTime.toFixed()} seconds__`) +
					`\n\n**default cooldown**: ${this.utils.parseTime(
						command.props.cooldown / 1000
					)}\n**[donor]() cooldown**: ${this.utils.parseTime(
						command.props.cooldown / 1000
					)}\n\nok!`);

		await this.db.addSpam(interaction.user.id);
		await interaction.editReply({embeds: [cooldownMessage]});
		return true;
	}
	return false;
}
async function updateStats(this: Bobb,interaction:CommandInteraction|ButtonInteraction, command: GenericCommand, lastCmd: number) {
	  console.log(`Interaction command: ${command.props.triggers[0]} ran by ${interaction.user.tag}:${interaction.user.id}`)

  let userID = interaction.user.id
	if (lastCmd && Date.now() - lastCmd < 500) {
		await this.db.addSpam(userID);
	}
	await this.botStats.findOneAndUpdate(
		{ _id: '60070be0f12d9e041931de68' },
		{ $inc: { slashCommands: 1 } }
	);
	await this.db.updateMember(userID, {
		$inc: { cmdsRan: 1 },
		$set: { latestCmd: new Date() }
	});
}
