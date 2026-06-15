import { QuartzComponentConstructor } from '@quartz-community/types';

interface FeaturedOptions {
    title: string;
    posts: string[];
    folder: string;
    showMore: boolean;
}
declare const Featured: QuartzComponentConstructor;

export { Featured, type FeaturedOptions };
