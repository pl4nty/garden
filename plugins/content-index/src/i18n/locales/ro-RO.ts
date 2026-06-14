export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Notițe recente",
      lastFewNotes: ({ count }: { count: number }) => `Ultimele ${count} notițe`,
    },
  },
};
