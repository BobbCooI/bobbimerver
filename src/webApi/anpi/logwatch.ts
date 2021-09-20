import express, {Request, Response} from 'express';
const router = express.Router();

router.post('/', (req: Request, res: Response) => {
  const {body} = req.body;
  if(!body.anime_title) return res.send({successful: false, error: "No anime title received."})
  if(!body.ep?.title || !body.ep?.number) return res.send({successful: false, error: "No episode title or number received."})
  console.log(body)
return res.send({successful: false, error: "Unknown"})
})

router.get('/', (_req: Request, res: Response) => {
  res.send("You are not supposed to be here nor log a watch here 🤨")
})
export default router;