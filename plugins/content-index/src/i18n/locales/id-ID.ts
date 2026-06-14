export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Catatan terbaru",
      lastFewNotes: ({ count }: { count: number }) => `${count} catatan terakhir`,
    },
  },
};
