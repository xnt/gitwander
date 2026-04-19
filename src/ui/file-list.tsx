import React from "react";
import { Box, Text } from "ink";
import type { FileInfo } from "../models/types.js";
import { getChurnLabel } from "../analysis/churn.js";

interface FileListProps {
  files: FileInfo[];
  selectedIndex: number;
  height: number;
  focused: boolean;
}

const churnColors: Record<string, string> = {
  hotspot: "red",
  active: "yellow",
  moderate: "cyan",
  stable: "green",
};

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedIndex,
  height,
  focused,
}) => {
  const visibleCount = Math.max(1, height - 2);
  const scrollOffset = Math.max(
    0,
    Math.min(selectedIndex - Math.floor(visibleCount / 2), files.length - visibleCount),
  );
  const visible = files.slice(scrollOffset, scrollOffset + visibleCount);

  return (
    <Box
      flexDirection="column"
      borderStyle="single"
      borderColor={focused ? "cyan" : "gray"}
      width="50%"
      paddingX={1}
    >
      <Text bold underline>
        Files ({files.length})
      </Text>
      {visible.map((file, i) => {
        const actualIndex = scrollOffset + i;
        const isSelected = actualIndex === selectedIndex;
        const label = getChurnLabel(file);
        const color = churnColors[label] ?? "white";
        return (
          <Box key={file.path}>
            <Text
              color={isSelected ? "cyan" : undefined}
              bold={isSelected}
              inverse={isSelected && focused}
            >
              {isSelected ? "▸ " : "  "}
              <Text color={color}>[{label}]</Text>{" "}
              {truncate(file.path, 35)}{" "}
              <Text dimColor>({file.commitCount}x)</Text>
            </Text>
          </Box>
        );
      })}
      {files.length === 0 && <Text dimColor>No files found</Text>}
    </Box>
  );
};

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
