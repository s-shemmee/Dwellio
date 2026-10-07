import { PROPERTYLISTINGSAMPLE } from '@/constants/index';
import { slugify } from '@/utils/slugify';
import type { PropertyProps } from '@/interfaces/index';

export const findPropertyBySlug = (
  slug: string | string[] | undefined,
): PropertyProps | undefined => {
  if (typeof slug !== 'string') return undefined;
  const key = slug.toLowerCase();
  return PROPERTYLISTINGSAMPLE.find((p) => slugify(p.name).toLowerCase() === key);
};
