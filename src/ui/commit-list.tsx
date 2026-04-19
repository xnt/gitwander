import React from "react";
import { Box, Text } from "ink";
import type { Commit } from "../models/types.js";

interface CommitListProps {
  commits: Commit[];
  selectedIndex: number;
  height: number;
  focused: boolean;
}

export const CommitList: React.FC<CommitListProps> = ({
  commits,
  selectedIndex,
  height,
  focused,
}) => {
  const visibleCount = Math.max(1, height - 2);
  const scrollOffset = Math.max(
    0,
    Math.min(selectedIndex - Math.floor(visibleCount / 2), commits.length - visibleCount),
  );
  const visible = commits.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? "cyan" : "gray"}
      width="50%"
      paddingX={1}
    >
      <Text bold underline>
        Commits ({commits.length})
      </Text>
      {visible.map((commit, i) => {
        const actualIndex = scrollOffset + i;
        const isSelected = actualIndex === selectedIndex;
        return (
          <Box key={commit.hash}>
            <Text
              color={isSelected ? "cyan" : undefined}
              bold={isSelected}
              inverse={isSelected && focused}
            >
              {isSelected ? "▸ " : "  "}
              <Text color="yellow">{commit.shortHash}</Text>{" "}
              {truncate(commit.message, 40)}
            </Text>
          </Box>
        );
      })}
      {commits.length === 0 && <Text dimColor>No commits found</Text>}
    </Box>
  );
};

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
