import { describe, it, expect } from "vitest";
import { appReducer, createInitialState } from "../src/state/app-state.js";

describe("appReducer", () => {
  const initial = createInitialState("/test/repo");

  it("starts with trail mode and list focus", () => {
    expect(initial.mode).toBe("trail");
    expect(initial.focusedPane).toBe("list");
    expect(initial.selectedIndex).toBe(0);
    expect(initial.loading).toBe(true);
  });

  it("SWITCH_MODE toggles between trail and terrain", () => {
    const s1 = appReducer(initial, { type: "SWITCH_MODE" });
    expect(s1.mode).toBe("terrain");
    expect(s1.selectedIndex).toBe(0);

    const s2 = appReducer(s1, { type: "SWITCH_MODE" });
    expect(s2.mode).toBe("trail");
  });

  it("MOVE_DOWN increments selectedIndex", () => {
    const withData = appReducer(initial, {
      type: "SET_DATA",
      commits: [
        { hash: "a", shortHash: "a", author: "A", date: new Date(), message: "m1", files: [] },
        { hash: "b", shortHash: "b", author: "B", date: new Date(), message: "m2", files: [] },
      ],
      files: [],
      groups: [],
    });

    const moved = appReducer(withData, { type: "MOVE_DOWN" });
    expect(moved.selectedIndex).toBe(1);
  });

  it("MOVE_DOWN does not exceed list bounds", () => {
    const withData = appReducer(initial, {
      type: "SET_DATA",
      commits: [
        { hash: "a", shortHash: "a", author: "A", date: new Date(), message: "m", files: [] },
      ],
      files: [],
      groups: [],
    });

    const moved = appReducer(withData, { type: "MOVE_DOWN" });
    expect(moved.selectedIndex).toBe(0);
  });

  it("MOVE_UP decrements selectedIndex", () => {
    let s = appReducer(initial, {
      type: "SET_DATA",
      commits: [
        { hash: "a", shortHash: "a", author: "A", date: new Date(), message: "m1", files: [] },
        { hash: "b", shortHash: "b", author: "B", date: new Date(), message: "m2", files: [] },
      ],
      files: [],
      groups: [],
    });
    s = appReducer(s, { type: "MOVE_DOWN" });
    s = appReducer(s, { type: "MOVE_UP" });
    expect(s.selectedIndex).toBe(0);
  });

  it("FOCUS_DETAIL switches to detail pane", () => {
    const s = appReducer(initial, { type: "FOCUS_DETAIL" });
    expect(s.focusedPane).toBe("detail");
  });

  it("GO_BACK switches to list pane", () => {
    let s = appReducer(initial, { type: "FOCUS_DETAIL" });
    s = appReducer(s, { type: "GO_BACK" });
    expect(s.focusedPane).toBe("list");
  });

  it("SET_ERROR stores the error and clears loading", () => {
    const s = appReducer(initial, { type: "SET_ERROR", error: "Not a git repo" });
    expect(s.error).toBe("Not a git repo");
    expect(s.loading).toBe(false);
  });
});
