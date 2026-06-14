export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Notas recientes",
      lastFewNotes: ({ count }: { count: number }) => `Últimas ${count} notas`,
    },
  },
};
