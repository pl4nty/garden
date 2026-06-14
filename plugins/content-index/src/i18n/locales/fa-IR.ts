export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "یادداشت‌های اخیر",
      lastFewNotes: ({ count }: { count: number }) => `${count} یادداشت اخیر`,
    },
  },
};
