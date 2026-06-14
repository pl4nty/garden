export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Останні нотатки",
      lastFewNotes: ({ count }: { count: number }) => `Останні нотатки: ${count}`,
    },
  },
};
