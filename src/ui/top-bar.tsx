import React from "react";
import { Box, Text } from "ink";
import type { Mode } from "../models/types.js";

interface TopBarProps {
  repoPath: string;
  mode: Mode;
}

export const TopBar: React.FC<TopBarProps> = ({ repoPath, mode }) => {
  const modeLabel = mode === "trail" ? "Trail (Commits)" : "Terrain (Files)";

  return (
    <Box
      borderStyle="single"
      borderBottom={false}
      paddingX={1}
      justifyContent="space-between"
    >
      <Text bold color="cyan">
        GitWander
      </Text>
      <Text dimColor>{repoPath}</Text>
      <Text color="yellow">{modeLabel}</Text>
    </Box>
  );
};
