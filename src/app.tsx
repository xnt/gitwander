import React, { useReducer, useEffect } from "react";
import { Box, Text, useInput, useStdout } from "ink";
import { TopBar } from "./ui/top-bar.js";
import { Footer } from "./ui/footer.js";
import { CommitList } from "./ui/commit-list.js";
import { CommitDetail } from "./ui/commit-detail.js";
import { FileList } from "./ui/file-list.js";
import { FileDetail } from "./ui/file-detail.js";
import { appReducer, createInitialState } from "./state/app-state.js";
import { readGitLog } from "./git/reader.js";
import { parseGitLog } from "./git/parser.js";
import { buildFileInfos } from "./analysis/churn.js";
import { groupFilesByDirectory } from "./analysis/grouping.js";

interface AppProps {
  repoPath: string;
  onExit: () => void;
}

export const App: React.FC<AppProps> = ({ repoPath, onExit }) => {
  const [state, dispatch] = useReducer(appReducer, createInitialState(repoPath));
  const { stdout } = useStdout();
  const termHeight = stdout?.rows ?? 24;
  const contentHeight = termHeight - 4;

  useEffect(() => {
    try {
      const raw = readGitLog(repoPath);
      const commits = parseGitLog(raw);
      const files = buildFileInfos(commits);
      const groups = groupFilesByDirectory(files);
      dispatch({ type: "SET_DATA", commits, files, groups });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      dispatch({ type: "SET_ERROR", error: message });
    }
  }, [repoPath]);

  useInput((input, key) => {
    if (input === "q") {
      onExit();
      return;
    }

    if (key.tab) {
      dispatch({ type: "SWITCH_MODE" });
      return;
    }

    if (key.return) {
      dispatch({ type: "FOCUS_DETAIL" });
      return;
    }

    if (input === "b") {
      dispatch({ type: "GO_BACK" });
      return;
    }

    if (key.upArrow || input === "k") {
      dispatch({ type: "MOVE_UP" });
      return;
    }

    if (key.downArrow || input === "j") {
      dispatch({ type: "MOVE_DOWN" });
      return;
    }
  });

  if (state.loading) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="cyan">Loading repository history...</Text>
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="red">Error: {state.error}</Text>
        <Text dimColor>Press q to quit</Text>
      </Box>
    );
  }

  const selectedCommit =
    state.mode === "trail" ? state.commits[state.selectedIndex] ?? null : null;
  const selectedFile =
    state.mode === "terrain" ? state.files[state.selectedIndex] ?? null : null;

  return (
    <Box flexDirection="column">
      <TopBar repoPath={state.repoPath} mode={state.mode} />
      <Box flexDirection="row" height={contentHeight}>
        {state.mode === "trail" ? (
          <>
            <CommitList
              commits={state.commits}
              selectedIndex={state.selectedIndex}
              height={contentHeight}
              focused={state.focusedPane === "list"}
            />
            <CommitDetail
              commit={selectedCommit}
              focused={state.focusedPane === "detail"}
              scrollOffset={state.detailScrollOffset}
            />
          </>
        ) : (
          <>
            <FileList
              files={state.files}
              selectedIndex={state.selectedIndex}
              height={contentHeight}
              focused={state.focusedPane === "list"}
            />
            <FileDetail
              file={selectedFile}
              focused={state.focusedPane === "detail"}
              scrollOffset={state.detailScrollOffset}
            />
          </>
        )}
      </Box>
      <Footer />
    </Box>
  );
};
