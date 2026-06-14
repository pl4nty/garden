export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `время чтения ~${minutes} мин.`,
    },
  },
};
