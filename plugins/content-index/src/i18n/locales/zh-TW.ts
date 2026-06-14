export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "最近的筆記",
      lastFewNotes: ({ count }: { count: number }) => `最近的 ${count} 條筆記`,
    },
  },
};
