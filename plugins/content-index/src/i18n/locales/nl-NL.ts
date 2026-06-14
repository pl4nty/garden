export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Recente notities",
      lastFewNotes: ({ count }: { count: number }) => `Laatste ${count} notities`,
    },
  },
};
