export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "最近の記事",
      lastFewNotes: ({ count }: { count: number }) => `最新の${count}件`,
    },
  },
};
