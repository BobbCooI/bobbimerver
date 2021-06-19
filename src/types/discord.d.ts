import { Message, Interaction } from 'discord.js';
import { APIGuildInteraction } from 'discord-api-types/v8';


export type webhook = {
  type:string,
  user?: string,
  content?: string,
  embedContent: string
}

export interface GuildInteraction extends APIGuildInteraction, Interaction {
  isInteraction?: boolean;
}