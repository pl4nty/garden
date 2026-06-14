export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Соңғы жазбалар",
      lastFewNotes: ({ count }: { count: number }) => `Соңғы ${count} жазба`,
    },
  },
};
