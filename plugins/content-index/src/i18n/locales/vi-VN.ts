export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Ghi chú gần đây",
      lastFewNotes: ({ count }: { count: number }) => `${count} Trang gần đây`,
    },
  },
};
