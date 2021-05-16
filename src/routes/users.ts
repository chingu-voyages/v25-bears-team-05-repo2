import * as express from "express";
import { Response } from "express";
import { getProfileById } from "../db/utils/get-profile-by-id/get-profile-by-id";
import { routeProtector } from "../middleware/route-protector";
import { body, param, validationResult } from "express-validator/check";
import { sanitizeBody } from "express-validator/filter";
import { UserModel } from "../models/user/user.model";
import { IProfileData } from "../models/user/user.types";
import { decrypt } from "../utils/crypto";
import { getVisibleThreads } from "../db/utils/get-visible-threads/get-visible-threads";
const router = express.Router();

router.get(
  "/:id",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      if (req.params.id === "me") {
        const homeProfileData = await getProfileById(req.user._id);
        return res.status(200).send(homeProfileData);
      } else {
        const otherUserData = await getProfileById(req.params.id);
        return res.status(200).send(otherUserData);
      }
    } catch (err) {
      if (err.message === "Unable to find profile for id") {
        return res.status(404).send({
          errors: [
            {
              "location": "/users",
              "msg": `invalid id ${req.params.id} ${err.message}`,
              "param": "id",
            },
          ],
        });
      }
      return res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": `${err.message}`,
            "param": "unknown",
          },
        ],
      });
    }
  }
);

router.get(
  "/:id/connections",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    if (req.params.id === "me") {
      res.status(200).send(req.user.connections);
    } else {
      try {
        const otherUser = await UserModel.findById(req.params.id);
        if (otherUser) {
          return res.status(200).send(otherUser.connections);
        } else {
          return res.status(404).send({
            errors: [
              {
                "location": "/users",
                "msg": `User ${req.params.id} not found`,
                "param": "id",
              },
            ],
          });
        }
      } catch (err) {
        return res.status(500).send({
          errors: [
            {
              "location": "/users",
              "msg": `${err.message}`,
              "param": "unknown",
            },
          ],
        });
      }
    }
  }
);

router.put(
  "/connections/:id",
  routeProtector,
  [
    param("id").not().isEmpty().trim().escape(),
    body("isTeamMate").not().isEmpty().isBoolean().trim().escape(),
  ],
  async (req: any, res: Response) => {
    if (req.params.id === "me") {
      return res.status(400).send({
        errors: [
          {
            "location": "/users",
            "msg": "Can't use 'me' in this type of request",
            "param": "id",
          },
        ],
      });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    
    try {
      await req.user.addConnectionToUser(req.params.id, req.body.isTeamMate);
      return res
        .status(200)
        .send([req.user.connections, req.user.connectionOf]);
    } catch (err) {
      if (err.message === "User id not found") {
        return res.status(404).send({
          errors: [
            {
              "location": "/users",
              "msg": `Id: ${req.params.id} ${err.message}`,
              "param": "id",
            },
          ],
        });
      }
      return res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": `${err.message}`,
            "param": "unknown",
          },
        ],
      });
    }
  }
);

router.delete(
  "/connections/:id",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    if (req.params.id === "me") {
      return res.status(400).send({
        errors: [
          {
            "location": "param",
            "msg": "Can't use 'me' in this type of request",
            "param": "id",
          },
        ],
      });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      await req.user.deleteConnectionFromUser(req.params.id);
      return res
        .status(200)
        .send([req.user.connections, req.user.connectionOf]);
    } catch (err) {
      if (
        err.message.includes("is not a connection") ||
        err.message.includes("User id not found")
      ) {
        return res.status(404).send({
          errors: [
            {
              "location": "/users",
              "msg": `${err.message}`,
              "param": "id",
            },
          ],
        });
      }
      res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": "Unknown server or database error",
            "param": "unknown",
          },
        ],
      });
    }
  }
);

router.patch(
  "/:id",
  routeProtector,
  [
    body("firstName").trim().escape(),
    body("lastName").trim().escape(),
    body("avatar").custom((value) => {
      if (value) {
        try {
          new URL(value);
          return true;
        } catch (err) {
          return false;
        }
      } else {
        return true;
      }
    }),
    sanitizeBody("avatar").customSanitizer((value) => {
      return value.trim();
    }),
    body("jobTitle").trim().escape(),
    param("id").not().isEmpty().trim().escape(),
  ],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    if (req.params.id !== "me") {
      return res.status(400).send({
        errors: [
          {
            "location": "/users",
            "msg": `This operation can only be completed on the requesting user's profile. Id must be 'me'`,
            "param": "id",
          },
        ],
      });
    }
    const profileUpdateRequest: IProfileData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      avatarUrl: req.body.avatar,
    };

    try {
      await req.user.updateUserProfile(profileUpdateRequest);
      return res.status(200).send({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        jobTitle: req.user.jobTitle,
        avatar: req.body.avatar,
        email: decrypt(req.user.auth.email),
      });
    } catch (err) {
      return res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": `Unable to complete. ${err.message}`,
            "param": "null",
          },
        ],
      });
    }
  }
);

/**
 * This gets threads object for user with id. If id=me, gets own thread object
 */
router.get(
  "/:id/threads",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    if (req.params.id === "me") {
      return res
        .status(200)
        .send({ id: req.user.id, threads: req.user.threads });
    }

    try {
      const targetUser = await UserModel.findById(req.params.id);
      if (targetUser) {
        // If user is a connection, return all threads
        // If not a connection, only return threads with a "anyone" visibility
        if (targetUser.connections[req.user.id] !== undefined) {
          return res.status(200).send({
            id: targetUser.id.toString(),
            threads: targetUser.threads,
          });
        } else {
          const onlyVisibleThreads = getVisibleThreads(targetUser.threads);
          return res.status(200).send({
            id: targetUser.id.toString(),
            threads: onlyVisibleThreads,
          });
        }
      } else {
        return res.status(404).send({
          errors: [
            {
              "location": "/users",
              "msg": `User ${req.params.id} not found`,
              "param": "id",
            },
          ],
        });
      }
    } catch (err) {
      return res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": `${err.message}`,
            "param": "unknown",
          },
        ],
      });
    }
  }
);

router.get(
  "/:id/notifications",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    // Place holder for now
    const notifications =
      await req.user.getUnreadNotificationsForUserByNotificationIds();
    return res.status(200).send(notifications);
  }
);

export default router;
