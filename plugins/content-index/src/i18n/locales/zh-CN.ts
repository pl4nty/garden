export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "最近的笔记",
      lastFewNotes: ({ count }: { count: number }) => `最近的${count}条笔记`,
    },
  },
};
