import { formatDate } from "@quartz-community/utils/date";
import { getDate } from "@quartz-community/utils/sort";

interface Props {
  date: Date;
  locale?: string;
}

export { getDate };

export function DateComponent({ date, locale }: Props) {
  return <time datetime={date.toISOString()}>{formatDate(date, locale)}</time>;
}
