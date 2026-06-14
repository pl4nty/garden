export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "최근 게시글",
      lastFewNotes: ({ count }: { count: number }) => `최근 ${count} 건`,
    },
  },
};
