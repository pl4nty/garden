export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Zuletzt bearbeitete Seiten",
      lastFewNotes: ({ count }: { count: number }) => `Letzte ${count} Seiten`,
    },
  },
};
