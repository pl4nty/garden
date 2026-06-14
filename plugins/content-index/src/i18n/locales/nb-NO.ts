export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Nylige notat",
      lastFewNotes: ({ count }: { count: number }) => `Siste ${count} notat`,
    },
  },
};
