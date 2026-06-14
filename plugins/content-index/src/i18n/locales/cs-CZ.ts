export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Nejnovější poznámky",
      lastFewNotes: ({ count }: { count: number }) => `Posledních ${count} poznámek`,
    },
  },
};
