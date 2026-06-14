export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "הערות אחרונות",
      lastFewNotes: ({ count }: { count: number }) => `${count} הערות אחרונות`,
    },
  },
};
