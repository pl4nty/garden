export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Notes recents",
      lastFewNotes: ({ count }: { count: number }) => `Últimes ${count} notes`,
    },
  },
};
