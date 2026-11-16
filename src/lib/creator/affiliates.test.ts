import { describe, expect, it } from "vitest";
import { categoryRateError, paginate, resolveRate } from "./affiliates";

const s = { rules: [{ id: "r", name: "Std", rate: 20, isDefault: true }], categoryRates: { ebook: 30 }, items: [{ id: "e", kind: "ebook" }] } as never;
describe("commission source", () => {
  it("personal rate wins over product rate", () => expect(resolveRate(s, { itemId: "e", ruleId: "r" }, { rate: 12 })).toEqual({ rate: 12, source: "personal" }));
  it("product rate wins over category default", () => expect(resolveRate(s, { itemId: "e", ruleId: "r" })).toEqual({ rate: 20, source: "product" }));
  it("falls back to category default", () => expect(resolveRate(s, { itemId: "e", ruleId: "gone" })).toEqual({ rate: 30, source: "category" }));
  it("rejects rates outside 1–90%", () => { expect(categoryRateError("0")).not.toBe(""); expect(categoryRateError("91")).not.toBe(""); expect(categoryRateError("25")).toBe(""); });
  it("paginates ten per page", () => expect(paginate(Array.from({ length: 23 }, (_, i) => i), 3)).toEqual({ rows: [20, 21, 22], page: 3, pages: 3 }));
});
