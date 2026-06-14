export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `閱讀時間約 ${minutes} 分鐘`,
    },
  },
};
