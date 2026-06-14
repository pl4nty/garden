export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `${minutes} dakika okuma süresi`,
    },
  },
};
