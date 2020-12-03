import { chunkList } from "./chunk-list";

describe.only("chunk tests", () => {
  test("function chunks arrays properly as per limit and offset", () => {
    const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20 ];

    const arr1 = chunkList(testArray, 30, 1000);
    expect(arr1).toHaveLength(20);

    const arr2 = chunkList(testArray, 5, 5);
    expect(arr2).toHaveLength(5);
    expect(arr2[0]).toBe(6);

    const arr3 = chunkList(testArray, 10, 18);
    expect(arr3).toHaveLength(2);

    const arr4 = chunkList(testArray, 5, 15);
    expect(arr4).toHaveLength(5);

    const arr5 = chunkList(testArray, 2, 0);
    expect(arr5[0]).toBe(1);
    expect(arr5[1]).toBe(2);

    const arr6 = chunkList(testArray, 8, 8);
    expect(arr6[0]).toBe(9);
    expect(arr6[7]).toBe(16);

  });
});
