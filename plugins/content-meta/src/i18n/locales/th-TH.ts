export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `อ่านราว ${minutes} นาที`,
    },
  },
};
