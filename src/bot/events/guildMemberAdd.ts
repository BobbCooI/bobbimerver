import { Position } from '@lib/utils/constants';
import { GuildMember } from 'discord.js';

exports.handle = async function (member: GuildMember) {
  await member.roles.add(Position.BUDDY);
  console.log(`SUCCESSFULLY ADDED BUDDY ROLE TO ${member.user.tag}`)
}