export const activityService = {
  saveActivity: async (
    userId: string,
    data: unknown
  ): Promise<{ success: boolean; timestamp: string }> => {
    return Promise.resolve({ success: true, timestamp: new Date().toISOString() });
  },
  shareActivity: async (userId: string, data: unknown, otherUsers: string[]): Promise<void> => {
    return Promise.resolve();
  },
};
