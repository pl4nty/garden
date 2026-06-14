export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Naujausi užrašai",
      lastFewNotes: ({ count }: { count: number }) =>
        count === 1
          ? "Paskutinis 1 užrašas"
          : count < 10
            ? `Paskutiniai ${count} užrašai`
            : `Paskutiniai ${count} užrašų`,
    },
  },
};
