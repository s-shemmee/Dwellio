import { Host, PropertyProps, Review } from '@/interfaces/index';

const ALL_AMENITIES = [
  'Mountain view',
  'Chef',
  'Cleaning available during stay',
  'Pool - infinity',
  'Kitchen',
  'Shared beach access',
  'Butler',
  'Bartender',
  'Hot tub',
  'Wifi',
];

const HOSTS: Host[] = [
  {
    name: 'Mainstream',
    hostingSince: 'Superhost · 5 years hosting',
    bio: "I'm passionate about providing exceptional experiences for my guests. I love sharing local recommendations and making sure everyone has a comfortable stay.",
  },
  {
    name: 'Amira Benali',
    hostingSince: 'Superhost · 3 years hosting',
    bio: 'I grew up nearby and love helping guests find the best food, trails and hidden spots in the area.',
  },
  {
    name: 'Lucas Ferreira',
    hostingSince: '2 years hosting',
    bio: 'I look after every detail of the property myself, so you can arrive and just relax.',
  },
  {
    name: 'Hana Tanaka',
    hostingSince: 'Superhost · 7 years hosting',
    bio: 'Hosting is my passion. Message me anytime and I will happily help plan your stay.',
  },
];

const reviewerAvatar = (n: number) => `/assets/images/reviwer_${n}.png`;

const SAMPLE_REVIEWS: Review[] = [
  {
    id: 1,
    author: 'Kerry',
    avatar: reviewerAvatar(1),
    yearsOnPlatform: 3,
    date: '2024-03-12',
    tripType: 'Family trip',
    rating: 5,
    comment:
      "I simply don't have the words to describe how incredibly beautiful this place and its surroundings are. This is a wonderful remote spot that is simply breathtaking.",
  },
  {
    id: 2,
    author: 'Pooja',
    avatar: reviewerAvatar(2),
    yearsOnPlatform: 1,
    date: '2024-03-04',
    tripType: 'Family trip',
    rating: 5,
    comment:
      'We stayed at this home for a family vacation of 7 adults (including 3 couples, 1 baby) and had a fantastic stay. The house was BEAUTIFUL and honestly better than shown in pictures.',
  },
  {
    id: 3,
    author: 'Cindy & Ben',
    avatar: reviewerAvatar(3),
    yearsOnPlatform: 1,
    date: '2023-08-21',
    tripType: 'Family trip',
    rating: 4.5,
    comment:
      "I simply don't have the words to describe how incredibly beautiful the villa and its surroundings are. This is a wonderful remote spot that is simply breathtaking.",
  },
  {
    id: 4,
    author: 'Marnie',
    avatar: reviewerAvatar(4),
    yearsOnPlatform: 5,
    date: '2023-01-17',
    tripType: 'Family trip',
    rating: 4.5,
    comment:
      'We stayed at this home for a family vacation of 7 adults (including 3 couples, 1 baby) and had a fantastic stay. The house was BEAUTIFUL and honestly better than shown in pictures.',
  },
];

const OVERRIDES: Record<string, Partial<PropertyProps>> = {
  'Modern Beachfront Villa': {
    reviewCount: 345,
    publishedAt: '2024-07-01',
    description:
      "Feel like exploring the coast? Start the day with a hike on one of the area's many trails. Weave your way around the gated community to find secluded sandy coves for swimming and paddleboarding.\n\nWhen you're ready to chill with friends, the beach house pool awaits. Spend the night entertaining in the outdoor lounge, sipping drinks in the hot tub, and gazing out over incredible ocean views.\n\nThe space\nBEDROOM & BATHROOM\n• Bedroom 1 - Primary: King size bed, ensuite bathroom with stand-alone rain shower, dual vanity, walk-in closet, television, sofa, deck, balcony, ocean view",
  },
};

export const withDetails = (property: PropertyProps, index: number): PropertyProps => {
  const { city, state, country } = property.address;
  const highlights = property.category.slice(0, 3).join(', ').toLowerCase();

  const amenities = ALL_AMENITIES.filter((_, i) => (i + index) % 5 !== 4);

  const generated: Partial<PropertyProps> = {
    description:
      `Welcome to ${property.name}, a ${property.offers.bed}-bedroom stay in ${state}, ${country}. ` +
      `Wake up to calm mornings, take your time over breakfast, and explore the surroundings at your own pace. ` +
      `The home is set up for comfort and privacy, with highlights including ${highlights}.\n\n` +
      `Whether you are travelling as a family or with friends, there is plenty of space to spread out, ` +
      `cook together, and unwind in the evening. Local restaurants, shops and sights are a short trip away, ` +
      `and your host is always happy to share recommendations for ${city} and beyond.`,
    amenities,
    reviews: SAMPLE_REVIEWS,
    reviewCount: 120 + ((index * 37) % 300),
    publishedAt: new Date(Date.UTC(2024, index % 12, 1 + (index % 28))).toISOString(),
    host: HOSTS[index % HOSTS.length],
  };

  return { ...generated, ...OVERRIDES[property.name], ...property };
};
