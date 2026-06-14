export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `Se lee en ${minutes} min`,
    },
  },
};
