import { QuartzComponentProps } from '@quartz-community/types';
import { JSX } from 'preact';

interface ContentMetaOptions {
    /**
     * Whether to display reading time
     */
    showReadingTime: boolean;
    showComma: boolean;
}
declare const _default: (opts?: Partial<ContentMetaOptions>) => {
    ({ cfg, fileData, displayClass }: QuartzComponentProps): JSX.Element | null;
    css: string;
};

export { _default as ContentMeta, type ContentMetaOptions };
