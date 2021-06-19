import gogoScrap from "../../utils/scrapers/gogo";
import { slugify, decode64 } from "../../utils/utils";
//import mal from "mal-scraper";
import _ from "lodash";
import express, { Request, Response } from "express";
const router = express.Router();
import Stats from "../../db/models/Stats";
import Users, { animeWatch , episode} from "../../db/models/Person";
router.post(
  "/",
  async (req: Request, res: Response): Promise<any> => {
    console.log(req.cookies);
    if (req.body.gg) {
      try {
        let link = await gogoScrap(req.body.gg);
        if (link) return res.send({ success: true, link });
      } catch (e) {
        return res.send({ success: false, error: e });
      }
    } else if (req.body.bb) {
      try {
        if (!req.body?.uuid) throw new Error("Please log in first.");
        /*	const search = await axios.get(
				`https://ajax.gogocdn.net/site/loadAjaxSearch?keyword=${utils.decode64(
						req.body.bb=="Black Clover"?"Black Clover TV":req.body.bb
					)}`,
			).catch(e => console.log(e));*/
        let title = decode64(req.body.bb);
        switch (title) {
          case "Black Clover":
            title = "Black Clover TV";
            break;
          case "Ansatsu Kyoushitsu":
            if (parseInt(req.body.epMeta.num) > 1)
              title = "Ansatsu Kyoushitsu TV-";
            break;
          case "Ansatsu Kyoushitsu 2nd Season":
            if (parseInt(req.body.epMeta.num) >= 1)
              title = "Ansatsu Kyoushitsu TV 2nd Season";
            break;
        }

        const slugifiedTitle = slugify(title);
        let slugTitle = `https://gogo-play.net/videos/${slugifiedTitle}-episode-${slugify(
          req.body.epMeta.num
        )}`;
        console.log("Gogo slug url title:", slugTitle);
        let link = await gogoScrap(slugTitle);
        if (link) {
          let addToSet = {};
          let userInfo = await Users.findOne({ UUID: req.body.uuid });
          if (!userInfo)
            throw new Error(
              "user not found.. have you registered properly? if you have, please contact Bobb#3350 on discord about this!.."
            );
          let isInDB = userInfo.animesWatch?.find(t => t?.title == title);
          if (!isInDB) {
            addToSet = {
              animesWatch: {
                title,
                episodeCount: req.body.epCount,
                rating: req.body.rating || 0,
                start: new Date(),
                episodes: [
                  {
                    aniTitle: title,
                    title: req.body.epMeta.title,
                    num: parseInt(req.body.epMeta.num),
                    timeBegan: new Date(),
                    finished: false
                  }
                ]
              }
            };
          } else {
            //       if(!(userInfo.animeWatch.episodes.some((t: animeWatch) => t?.title == req.body.meta.title))) {
            let anindex = _.findIndex(
              userInfo.animesWatch,
              (t: animeWatch) => t.title == title
            );
            let mongodex = `animesWatch.${anindex}.episodes`;
            let epInDb = userInfo.animesWatch?.[anindex].episodes.find(
              (ep: episode) => ep.aniTitle == title
            );
            if (!epInDb) addToSet = {
              [mongodex]: {
                aniTitle: title,
                title: req.body.epMeta.title,
                num: parseInt(req.body.epMeta.num),
                timeBegan: new Date(),
                finished: false
              }
            };
            
    //        if (Object.keys(addToSet)[0].includes("-1")) addToSet = {};
          }

          console.log("addtoset", addToSet);
          let ff = await Users.findOneAndUpdate(
            { UUID: req.body.uuid },
            { $inc: { episodesFetched: 1 }, $addToSet: addToSet },
            { new: true }
          ).catch(e => console.log(e));
          console.log(ff);
          await Stats.updateOne(
            { _id: "60070be0f12d9e041931de68" },
            { $inc: { episodesFetched: 1 } }
          );

          return res.send({
            success: true,
            main: link.link
          });
        } else throw new Error("Unknown error while fetching the stream.");
      } catch (e) {
        console.log(e);
        return res.send({
          success: false,
          error:
            e.error || e.message || "There was an error fetching that episode."
        });
      }
    } else {
      return res.send("why are you here");
    }
    return res.send({ success: false, error: "🤨" });
  }
);
/*let cachedSearches = {};

// slow right now, prob not going to use this.
router.get("/search", async (req, res) => {
  console.log(cachedSearches[req.query.terms]);
  if (req.query.terms) {
    if (
      cachedSearches[req.query.terms.toLowerCase()] &&
      cachedSearches[req.query.terms.toLowerCase()].time > Date.now()
    ) {
      res.setHeader(
        "Cache-Expires",
        cachedSearches[req.query.terms.toLowerCase()].time
      );
      res.setHeader(
        "Expires-In",
        cachedSearches[req.query.terms.toLowerCase()].time - Date.now()
      );
      return res.send({
        success: true,
        res: cachedSearches[req.query.terms.toLowerCase()].data
      });
    }
    let teSearch = await mal.search.search("anime", {
      term: req.query.terms
    });

    teSearch.length > 10 ? (teSearch.length = 10) : teSearch;
    cachedSearches[req.query.terms.toLowerCase()] = {
      time: Date.now() + 1000 * 60 * 60 * 3,
      data: teSearch
    };
    return res.send({ success: true, res: teSearch });
  } else if (req.query.score) {
    if (!parseFloat(req.query.score))
      return res.send({ success: false, error: "Invalid score number" });
    try {
      let scSearch = await mal.search.search("anime", {
        rating: req.query.score
      });
      return res.send({ success: true, res: scSearch });
    } catch (e) {
      return res.send({ success: false, error: e.error || e.message });
    }
  } else {
    return res.send({ success: false, error: "Invalid request.." });
  }
});*/
export default router;
