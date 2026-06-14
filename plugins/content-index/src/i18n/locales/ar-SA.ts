export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "آخر الملاحظات",
      lastFewNotes: ({ count }: { count: number }) => `آخر ${count} ملاحظة`,
    },
  },
};
