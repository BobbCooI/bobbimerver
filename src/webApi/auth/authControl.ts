import User from "../../../lib/db/models/Person";
import { generateUUID , decode64, makeID} from "../../../lib/utils/utils";
import Stats from "../../../lib/db/models/Stats";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { Request, Response } from 'express';
import config from "../../config.json"
interface jwtUserSign {
  username: string;
  userID: string;
  UUID: string
}
function jwtSignUser(user: jwtUserSign) {
  const threeDays = 60 * 60 * 24 * 3;
  return jwt.sign(user,config.jwtAccessSecret!, {
    expiresIn: threeDays
  });
};

  export async  function register(req: Request, res: Response): Promise<any> {
    const { pUsername } = req.body;
    const userCheck = await User.findOne({
      loweruser: pUsername.toLowerCase()
    });
    if (userCheck)
      return res.send({
        success: false,
        error: "This username is already in use."
      });

    const email = req.body.pEmail;
    const emailCheck = await User.findOne({
      email
    });
    if (emailCheck)
      return res.send({
        success: false,
        error: "This email account is already in use."
      });
    let origPass = req.body.pPassword
      ? decode64(req.body.pPassword).toString()
      : res.send({ success: false, error: "Password is needed." }); // get Original Pass
    let iD;
    let ePassword = CryptoJS.AES.encrypt(
      origPass as string,
     config.encryptWord!
    ).toString(); // Encrypt
    do {
      iD = makeID(8);
    } while (await User.findOne({ userID: iD }));

    const user = await User.create({
      username: req.body.pUsername,
      loweruser: req.body.pUsername.toLowerCase(),
      userID: iD,
      email: req.body.pEmail.toLowerCase(),
      ePassword,
      hPassword: origPass,
      UUID: generateUUID(),
      verified: false,
      dateCreate: new Date()
    });
    await Stats.findOneAndUpdate(
      { _id: "60070be0f12d9e041931de68" },
      { $inc: { usersCreated: 1 } },
      { new: true }
    );
    if (!user)
      return res.send({
        success: false,
        error: "Internal server error. Please report to developer."
      });
    return res.send({
      success: true
    });
  };
 export  async function login(req: Request, res: Response) : Promise<any> {
    try {
      const { pUsername } = req.body;
      // to Decrypt --		let password = req.body.pPassword ? CryptoJS.AES.decrypt(utils.decode64(req.body.pPassword),config.encryptWord).toString(CryptoJS.enc.Utf8) : res.status(403).send({error: "Password is needed."});
      let password = req.body.pPassword
        ? decode64(req.body.pPassword).toString()
        : res.send({ success: false, error: "Password is needed." }); // get Original Pass
  /*    const ePassword = CryptoJS.AES.encrypt(
        password as string,
       config.encryptWord!
      ).toString(); // Encrypt then encode*/

      const user = await User.findOne({
        loweruser: pUsername.toLowerCase()
      }).catch(e => console.log(e));

      // test a matching password
      if (!user)
        return res.send({
          success: false,
          error: "The login information was incorrect"
        });
      const isPassCorrect = await user
        .comparePassword(password as string)
        .catch((e: any) => console.log("comp password authcontrol error", e));
      if (!isPassCorrect) {
        return res.send({
          success: false,
          error: "The login information was incorrect"
        });
      }
      let userJson: any = user.toJSON();
      userJson = {
        username: userJson.username,
        userID: userJson.userID,
        UUID: userJson.UUID
      };

      return res.send({
        success: true,
        userInfo: userJson,
        token: jwtSignUser(userJson)
      });
    } catch (err) {
      console.log(err);
      return res.send({
        success: false,
        error: "An error has occured trying to log in"
      });
    }
  };

 export async function userCheck(req: Request, res: Response) : Promise<any>{
    const { pUsername } = req.body;

    const posib = await User.findOne({ loweruser: pUsername.toLowerCase() });
    if (posib) {
      return res.send({ good: false });
    } else {
      return res.send({ good: true });
    }
  };

 export async function emailCheck(req: Request, res: Response):Promise<any> {
    await Stats.updateOne(
      { _id: "60070be0f12d9e041931de68" },
      { $inc: { webRequests: 1 } }
    );

    const { pEmail } = req.body;

    const posib = await User.findOne({ email: pEmail.toLowerCase() });
    if (posib) {
      return res.send({ good: false });
    } else {
      return res.send({ good: true });
    }
 };
