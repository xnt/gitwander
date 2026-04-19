import React from "react";
import { Box, Text } from "ink";

export const Footer: React.FC = () => {
  return (
    <Box borderStyle="single" borderTop={false} paddingX={1} gap={2}>
      <Text dimColor>
        <Text bold>↑↓/jk</Text> navigate
      </Text>
      <Text dimColor>
        <Text bold>tab</Text> switch mode
      </Text>
      <Text dimColor>
        <Text bold>enter</Text> focus detail
      </Text>
      <Text dimColor>
        <Text bold>b</Text> go back
      </Text>
      <Text dimColor>
        <Text bold>q</Text> quit
      </Text>
    </Box>
  );
};
