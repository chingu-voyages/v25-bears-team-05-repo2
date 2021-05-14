import * as express from "express";
import { Response } from "express";
import { body, param } from "express-validator/check";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
import { ThreadModel } from "../models/thread/thread.model";
import { handleChainValidationResult } from "../middleware/handle-chain-validation-result";
import { ThreadCommentModel } from "../models/thread-comment/thread-comment.model";
const router = express.Router();

const handleGetComments = async (req: any, res: Response) => {
    try {
        const commentIds = req.params.id; // TODO: Check this works! I think this should return an array but need to try, url query should be: ?id=<commentId>&id=<commentId>&...
        const result = await ThreadModel.find({ _id: { $in: commentIds } });
        return res.status(200).send({ threadComments: result});
    } catch (err) {
        res.status(400).send({ errors: [{ 
            ...createError("Unable to get comments",
            `${err}`,
            "Error")
        }]});
    }
}
router.get("/", routeProtector, handleGetComments);

const postCommentValidationChain = [
    param("thread_id").exists().trim().escape(),
    body("content").exists().trim().escape(),
    body("attachments").custom((value) => !value || Array.isArray(value))
];
const handlePostComment = async(req: any, res: Response) => {
    try {
        const result = await req.user.addThreadComment({
        targetThreadId: req.params.thread_id,
        threadCommentData: {
            content: req.body.content, attachments: req.body.attachments
        }
        });
        return res.status(200).send(result);
    } catch (err) {
        res.status(400).send({ errors: [{ 
            ...createError("Unable to add comment",
            `${err}`,
            "Error")
        }]});
    }
};
router.post("/", routeProtector, postCommentValidationChain, handleChainValidationResult, handlePostComment);

const deleteCommentValidationChain = [param("comment_id").exists().trim().escape()];
const handleDeleteComment = async(req: any, res: Response) => {
    try {
        const result = await req.user.deleteThreadComment({ 
            targetThreadId: req.params.thread_id,
            targetThreadCommentId: req.params.comment_id
        });
        return res.status(200).send(result);
    } catch (err) {
        res.status(400).send({ errors: [{ 
            ...createError("Unable to delete comment",
            `${err}`,
            "Error")
        }]});
    }
};
router.delete("/:commentId", deleteCommentValidationChain, handleChainValidationResult, handleDeleteComment);

const getCommentValidationChain = [param("commentId").exists().trim().escape()];
const handleGetComment = async(req: any, res: Response) => {
    try {
        const result = await ThreadCommentModel.findById(req.params.commentId);
        return res.status(200).send(result);
    } catch (err) {
        res.status(400).send({ errors: [{ 
            ...createError("Unable to get comment",
            `${err}`,
            "Error")
        }]});
    }
};
router.get("/:commentId", getCommentValidationChain, handleChainValidationResult, handleGetComment);