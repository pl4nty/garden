export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `Es llegeix en ${minutes} min`,
    },
  },
};
