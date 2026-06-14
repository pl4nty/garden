import { QuartzComponentConstructor } from '@quartz-community/types';

interface SocialsOptions {
    links: Record<string, string>;
}
declare const Socials: QuartzComponentConstructor;

export { Socials, type SocialsOptions };
