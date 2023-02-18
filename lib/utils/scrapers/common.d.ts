import { Message } from 'discord.js';

export interface gotOptions {
  prefixUrl?: string;
  url: string;
  method: string;
  responseType: string;
  headers: {
    "User-Agent": string;
    Accept: string;
    "Content-Type": string;
    Authorization?: string;
  };
  body?: any;
  hooks?: any;
}
export interface ret {
  success: boolean;
  error?: string;
  res?: any;
}