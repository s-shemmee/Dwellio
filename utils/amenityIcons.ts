const ICON_DIR = '/assets/icons';

const AMENITY_ICON_RULES: { file: string; keywords: string[] }[] = [
  { file: 'wifi.png', keywords: ['wifi', 'wi-fi'] },
  { file: 'hot-tub.png', keywords: ['hot tub', 'hot-tub', 'hottub', 'jacuzzi'] },
  { file: 'shaker.png', keywords: ['bartender', 'bar service'] },
  { file: 'bell.png', keywords: ['butler', 'bell service'] },
  { file: 'chef.png', keywords: ['chef'] },
  { file: 'pool.png', keywords: ['pool'] },
  { file: 'broom.png', keywords: ['clean', 'housekeep', 'maid'] },
  { file: 'mountain.png', keywords: ['mountain'] },
  { file: 'sunrise.png', keywords: ['beach', 'sunrise', 'sunset'] },
  { file: 'pan.png', keywords: ['kitchen', 'cook'] },
];

export const getAmenityIcon = (amenity: string): string | null => {
  const name = amenity.trim().toLowerCase();
  const rule = AMENITY_ICON_RULES.find(({ keywords }) =>
    keywords.some((keyword) => name.includes(keyword)),
  );
  return rule ? `${ICON_DIR}/${rule.file}` : null;
};