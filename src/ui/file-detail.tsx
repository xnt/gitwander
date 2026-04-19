import React from "react";
import { Box, Text } from "ink";
import type { FileInfo } from "../models/types.js";
import { getChurnLabel } from "../analysis/churn.js";

interface FileDetailProps {
  file: FileInfo | null;
  focused: boolean;
  scrollOffset: number;
}

export const FileDetail: React.FC<FileDetailProps> = ({
  file,
  focused,
  scrollOffset,
}) => {
  if (!file) {
    return (
      <Box
        flexDirection="column"
        borderStyle="single"
        borderColor="gray"
        width="50%"
        paddingX={1}
      >
        <Text dimColor>Select a file to view details</Text>
      </Box>
    );
  }

  const label = getChurnLabel(file);
  const visibleCommits = file.recentCommits.slice(scrollOffset);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? "cyan" : "gray"}
      width="50%"
      paddingX={1}
    >
      <Text bold underline>
        File Detail
      </Text>
      <Box marginTop={1} flexDirection="column">
        <Text>
          <Text bold color="yellow">
            Path:{" "}
          </Text>
          {file.path}
        </Text>
        <Text>
          <Text bold color="yellow">
            Churn:{" "}
          </Text>
          {label} ({file.commitCount} commits)
        </Text>
        <Text>
          <Text bold color="yellow">
            Total changes:{" "}
          </Text>
          <Text color="green">+{file.totalAdditions}</Text>{" "}
          <Text color="red">-{file.totalDeletions}</Text>
        </Text>
        <Text>
          <Text bold color="yellow">
            Last modified:{" "}
          </Text>
          {file.lastModified.toLocaleDateString()}
        </Text>
        <Text>
          <Text bold color="yellow">
            First seen:{" "}
          </Text>
          {file.firstSeen.toLocaleDateString()}
        </Text>
      </Box>
      <Box marginTop={1} flexDirection="column">
        <Text bold>
          Recent commits ({file.recentCommits.length}):
        </Text>
        {visibleCommits.map((commit) => (
          <Text key={commit.hash}>
            {"  "}
            <Text color="yellow">{commit.shortHash}</Text>{" "}
            {commit.message}
          </Text>
        ))}
      </Box>
    </Box>
  );
};
