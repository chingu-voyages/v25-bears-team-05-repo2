import { Types } from "mongoose";
import getObjectDiffs from "./getObjectDiffs";

const base = {
    id: Types.ObjectId(),
    unnestedString: "one",
    nested: {
        string: "Hello world"
    },
    updatedAt: Date.now()
};
const object = {
    id: Types.ObjectId(),
    unnestedString: "two",
    nested: {
        string: "Hi world"
    },
    updatedAt: Date.now()
};

describe("Compares only one unnested property", () => {
    const propertiesWhiteList = ["unnestedString"];
    const diffs = getObjectDiffs(object, base, propertiesWhiteList);
    it("Has one property", () => expect(Object.keys(diffs)).toHaveLength(1));
    it("Has the whitelisted field name", () => expect(diffs).toHaveProperty("unnestedString"));
    it("As a string", () => expect(diffs["unnestedString"]).toEqual(expect.any(String)));
});

describe("Compares nested property", () => {
    const propertiesWhiteList = ["nested", "string"];
    const diffs = getObjectDiffs(object, base, propertiesWhiteList);
    it("As a nested string", () => expect(diffs["nested"]["string"]).toEqual(expect.any(String)));
});
