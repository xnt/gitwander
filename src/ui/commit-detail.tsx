import React from "react";
import { Box, Text } from "ink";
import type { Commit } from "../models/types.js";

interface CommitDetailProps {
  commit: Commit | null;
  focused: boolean;
  scrollOffset: number;
}

export const CommitDetail: React.FC<CommitDetailProps> = ({
  commit,
  focused,
  scrollOffset,
}) => {
  if (!commit) {
    return (
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        width="50%"
        paddingX={1}
      >
        <Text dimColor>Select a commit to view details</Text>
      </Box>
    );
  }

  const fileLines = commit.files.slice(scrollOffset);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? "cyan" : "gray"}
      width="50%"
      paddingX={1}
    >
      <Text bold underline>
        Commit Detail
      </Text>
      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text bold color="yellow">
            Hash:{" "}
          </Text>
          {commit.shortHash}
        </Text>
        <Text>
          <Text bold color="yellow">
            Author:{" "}
          </Text>
          {commit.author}
        </Text>
        <Text>
          <Text bold color="yellow">
            Date:{" "}
          </Text>
          {commit.date.toLocaleDateString()}
        </Text>
        <Text>
          <Text bold color="yellow">
            Message:{" "}
          </Text>
          {commit.message}
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text bold>
          Changed files ({commit.files.length}):
        </Text>
        {fileLines.map((file) => (
          <Text key={file.path}>
            {"  "}
            <Text color="green">+{file.additions}</Text>{" "}
            <Text color="red">-{file.deletions}</Text>{" "}
            {file.path}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
