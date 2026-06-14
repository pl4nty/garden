export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) => `زمان تقریبی مطالعه: ${minutes} دقیقه`,
    },
  },
};
