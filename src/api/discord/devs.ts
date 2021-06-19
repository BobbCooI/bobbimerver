import axios from "axios";
import { Request, Response } from "express";
export async function getDevs(req: Request, res: Response) {
  const userDiscApi = axios.create({
    baseURL: `https://discord.com/api/v8/users/`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bot ${process.env.botToken}`
    }
  });
  let re = await Promise.all(
    req.body["developers"].map(async (dev: string) => (await userDiscApi.get(dev)).data)
  ).catch((e: any) => console.log(e));
  let ret = re ? { success: true, developers: re } : { success: false };

  return res.send(ret);
}
