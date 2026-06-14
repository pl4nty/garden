export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Legutóbbi jegyzetek",
      lastFewNotes: ({ count }: { count: number }) => `Legutóbbi ${count} jegyzet`,
    },
  },
};
