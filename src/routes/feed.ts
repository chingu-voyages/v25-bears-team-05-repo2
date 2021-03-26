import * as express from "express";
import { Response } from "express";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
import { param, query } from "express-validator/check";
import getFeedBuckets from "../db/utils/get-feed-buckets/get-feed-buckets";
import { IBucketItem } from "../db/utils/get-feed-buckets/feed-buckets.types";
const router = express.Router();

async function handleGetFeed(req: express.Request, res: Response, destination: IBucketItem["destination"], queryItems: any) {
  try {
    const buckets = await getFeedBuckets({...queryItems, req, destination})
    res.status(200).send({ buckets });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .send({
        errors: [
          { ...createError("feed error", `database error. ${err}`, "n/a") },
        ],
      });
  }
}

router.get(
  "/:destination", 
  routeProtector, 
  [
    param("destination").exists().trim().escape(),
    query("olderThanDate").escape(),
    query("newerThanDate").escape()
  ], 
  (req: express.Request, res: Response) => {
    const destination = req.body.desintation;
    const olderThanDate = req.params.olderThanDate;
    const newerThanDate = req.params.newerThanDate;
    handleGetFeed(req, res, destination, {olderThanDate, newerThanDate});
  }
);

export default router;
