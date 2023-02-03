import express, {Request, Response} from 'express';
const router = express.Router();

router.get('/browse', (_req: Request, res: Response) => {
  console.log(res.locals.Bobb)
return res.send({successful: false, error: "Unknown"})
})

router.get('/', (_req: Request, res: Response) => {
  res.send("You are not supposed to be here nor log a watch here 🤨")
})
export default router;