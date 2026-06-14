export default {
  pages: {},
  components: {
    rss: {
      recentNotes: "Viimeisimmät muistiinpanot",
      lastFewNotes: ({ count }: { count: number }) => `Viimeiset ${count} muistiinpanoa`,
    },
  },
};
