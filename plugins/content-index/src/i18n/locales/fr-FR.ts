export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Notes récentes",
      lastFewNotes: ({ count }: { count: number }) => `Les dernières ${count} notes`,
    },
  },
};
