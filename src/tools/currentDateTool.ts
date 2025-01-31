import { z } from 'zod';
import { tool } from 'ai';

export const currentDateTool = {
  displayName: 'Get current date',
  tool: tool({
    description: 'Get the current date',
    parameters: z.object({}),
    execute: async () => {
      return new Date().toISOString();
    },
  }),
};

