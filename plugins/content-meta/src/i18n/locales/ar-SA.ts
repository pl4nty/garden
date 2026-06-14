export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) =>
        minutes == 1
          ? `دقيقة أو أقل للقراءة`
          : minutes == 2
            ? `دقيقتان للقراءة`
            : `${minutes} دقائق للقراءة`,
    },
  },
};
