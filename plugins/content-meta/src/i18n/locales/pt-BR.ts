export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `Leitura de ${minutes} min`,
    },
  },
};
