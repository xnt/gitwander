import type { AppState, Commit, FileInfo, FileGroup } from "../models/types.js";

export type Action =
  | { type: "SWITCH_MODE" }
  | { type: "MOVE_UP" }
  | { type: "MOVE_DOWN" }
  | { type: "FOCUS_DETAIL" }
  | { type: "GO_BACK" }
  | { type: "SCROLL_DETAIL_DOWN" }
  | { type: "SCROLL_DETAIL_UP" }
  | { type: "SET_DATA"; commits: Commit[]; files: FileInfo[]; groups: FileGroup[] }
  | { type: "SET_ERROR"; error: string };

export function createInitialState(repoPath: string): AppState {
  return {
    mode: "trail",
    repoPath,
    commits: [],
    files: [],
    groups: [],
    selectedIndex: 0,
    focusedPane: "list",
    detailScrollOffset: 0,
    loading: true,
    error: null,
  };
}

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SWITCH_MODE":
      return {
        ...state,
        mode: state.mode === "trail" ? "terrain" : "trail",
        selectedIndex: 0,
        focusedPane: "list",
        detailScrollOffset: 0,
      };

    case "MOVE_UP":
      if (state.focusedPane === "detail") {
        return {
          ...state,
          detailScrollOffset: Math.max(0, state.detailScrollOffset - 1),
        };
      }
      return {
        ...state,
        selectedIndex: Math.max(0, state.selectedIndex - 1),
        detailScrollOffset: 0,
      };

    case "MOVE_DOWN": {
      if (state.focusedPane === "detail") {
        return {
          ...state,
          detailScrollOffset: state.detailScrollOffset + 1,
        };
      }
      const maxIndex =
        state.mode === "trail"
          ? state.commits.length - 1
          : state.files.length - 1;
      return {
        ...state,
        selectedIndex: Math.min(maxIndex, state.selectedIndex + 1),
        detailScrollOffset: 0,
      };
    }

    case "FOCUS_DETAIL":
      return { ...state, focusedPane: "detail", detailScrollOffset: 0 };

    case "GO_BACK":
      return { ...state, focusedPane: "list", detailScrollOffset: 0 };

    case "SCROLL_DETAIL_DOWN":
      return { ...state, detailScrollOffset: state.detailScrollOffset + 1 };

    case "SCROLL_DETAIL_UP":
      return {
        ...state,
        detailScrollOffset: Math.max(0, state.detailScrollOffset - 1),
      };

    case "SET_DATA":
      return {
        ...state,
        commits: action.commits,
        files: action.files,
        groups: action.groups,
        loading: false,
      };

    case "SET_ERROR":
      return { ...state, error: action.error, loading: false };

    default:
      return state;
  }
}
