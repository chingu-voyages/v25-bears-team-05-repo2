import { IThread, ThreadType, ThreadVisibility } from "../thread.types";
import { LoremIpsum } from "lorem-ipsum";
import mongoose from "mongoose";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

/**
 * Returns array of a bunch of dummy threads for a user for aid with tests.
 * @param count number of users to create
 * @param forUserId userId
 */
export function createDummyPublicThreads(count: number, forUserId: string): IThread[] {
  const createdThreads: IThread[] = [];
  for (let i = 0; i < count; i++) {
    createdThreads.push({
      postedByUserId: mongoose.Types.ObjectId(forUserId),
      threadType: ThreadType.Post,
      visibility: ThreadVisibility.Anyone,
      content: {
        html: lorem.generateParagraphs(2)
      },
      comments: { },
      reactions: { },
      forks: { },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  return createdThreads;
}
