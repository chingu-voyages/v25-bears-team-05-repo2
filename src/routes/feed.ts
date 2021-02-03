import * as express from "express";
import { Response } from "express";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
import { query } from "express-validator/check";
import getFeedBuckets from "../db/utils/get-feed-buckets/get-feed-buckets";
import { IBucketItem } from "../db/utils/get-feed-buckets/feed-buckets.types";
const router = express.Router();


router.get(
  "/", 
  routeProtector, 
  [
    query("desination").not().isEmpty().escape(),
    query("latestBucketRecieved").escape(),
    query("oldestBucketRecieved").escape()
  ], 
  async (req: express.Request, res: Response) => {
 
  try {
    const destination = (req.params.desintation as IBucketItem["destination"]);
    const latestBucketRecieved = req.params.latestBucketRecieved;
    const oldestBucketRecieved = req.params.oldestBucketRecieved;
    const buckets = await getFeedBuckets({latestBucketRecieved, oldestBucketRecieved, req, destination})
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
});

export default router;
