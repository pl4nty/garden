export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Najnowsze notatki",
      lastFewNotes: ({ count }: { count: number }) => `Ostatnie ${count} notatek`,
    },
  },
};
