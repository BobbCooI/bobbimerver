import axios from "axios";
import { Request, Response } from "express";
import config from "../../config.json"
export async function getDevs(req: Request, res: Response) {
  const userDiscApi = axios.create({
    baseURL: `https://discord.com/api/v10/users/`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${config.botToken}`
    }
  });
  let re = await Promise.all(
    req.body["developers"].map(async (dev: string) => (await userDiscApi.get(dev)).data)
  ).catch((e: any) => console.log(e));
  let ret = re ? { success: true, developers: re } : { success: false };

  return res.send(ret);
}
