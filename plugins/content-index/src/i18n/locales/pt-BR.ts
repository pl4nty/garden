export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Notas recentes",
      lastFewNotes: ({ count }: { count: number }) => `Últimas ${count} notas`,
    },
  },
};
