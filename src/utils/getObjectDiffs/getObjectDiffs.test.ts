import { Types } from "mongoose";
import getObjectDiffs from "./getObjectDiffs";

const object = {
    content: { html: 'some kind of new content here' },
    threadType: 'photo',
    visibility: 1,
    _id: Types.ObjectId("60254ba04d60ff708b01f664"),
    postedByUserId: Types.ObjectId("60254ba04d60ff708b01f661"),
    createdAt: new Date("2021-02-11T15:22:08.071Z"),
    updatedAt: new Date("2021-02-11T15:22:08.223Z"),
    __v: 0
};
const base = {
    _id: Types.ObjectId("60254ba04d60ff708b01f664"),
    threadType: 'article',
    visibility: 0,
    postedByUserId: Types.ObjectId("60254ba04d60ff708b01f661"),
    content: { html: 'someSampleHTML' },
    createdAt: new Date("2021-02-11T15:22:08.071Z"),
    updatedAt: new Date("2021-02-11T15:22:08.071Z"),
    __v: 0
}

describe("Compares only one unnested property", () => {
    const propertiesWhiteList = ["threadType"];
    const diffs = getObjectDiffs(object, base, propertiesWhiteList);
    it("Has one property", () => expect(Object.keys(diffs)).toHaveLength(1));
    it("Has the whitelisted field name", () => expect(diffs).toHaveProperty("threadType"));
    it("As a string", () => expect(diffs["threadType"]).toEqual(expect.any(String)));
    it("Output looks correct", () => expect(diffs["threadType"]).toBe('<span class="removed">ar</span><span class="added">pho</span>t<span class="removed">icle</span><span class="added">o</span>'))
});

describe("Compares nested property", () => {
    const propertiesWhiteList = ["content", "html"];
    const diffs = getObjectDiffs(object, base, propertiesWhiteList);
    it("As a nested string", () => expect(diffs["content"]["html"]).toEqual(expect.any(String)));
    it("Output looks correct", () => expect(diffs["content"]["html"]).toBe('some<span class="removed">Sampl</span><span class="added"> kind of n</span>e<span class="removed">HTML</span><span class="added">w content here</span>'))
});
