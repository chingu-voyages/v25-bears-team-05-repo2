import { getThreadById } from "../../../../db/utils/get-thread-by-id/get-thread-by-id";

export const fetchThreadsById = async (req: any, res: any): Promise<void> => {
  try {
    const threadData = await getThreadById({ threadId: req.params.id });
    if (threadData) {
      return res.status(200).send(threadData);
    } else {
      res.status(404).send({ error: `Unable to find thread with id ${req.params.id}` });
    }
  } catch (err) {
    res.status(500).send({ error: `Server error when trying to find thread with id: ${req.params.id}` });
  }
};
