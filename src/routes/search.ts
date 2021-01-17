import * as express from "express";
import { Response } from "express";
import { query, validationResult } from "express-validator/check";
import { createError } from "../utils/errors";
import { routeProtector } from "../middleware/route-protector";
import { search } from "../db/search/search";
const router = express.Router();

router.get(
  "/",
  routeProtector,
  [query("query").exists().trim().escape()],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      const searchResults = await search({
        queryString: req.query.query,
        requestorId: req.user.id,
      });
      return res.status(200).send(searchResults);
    } catch (err) {
      res.status(400).send({
        errors: [
          {
            ...createError(
              "create thread POST request",
              `database error. ${err.Message}`,
              "req.body"
            ),
          },
        ],
      });
    }
  }
);

export default router;
