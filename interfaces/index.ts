export interface Host {
  name: string;
  avatar?: string;
  bio?: string;
  hostingSince?: string;
}

export interface Review {
  id: number | string;
  comment: string;
  author?: string;
  avatar?: string;
  yearsOnPlatform?: number;
  date?: string;
  tripType?: string;
  rating?: number;
}

export interface PropertyProps {
  name: string;
  address: {
    state: string;
    city: string;
    country: string;
  };
  rating: number;
  category: string[];
  price: number;
  offers: {
    bed: string;
    shower: string;
    occupants: string;
  };
  image: string;
  images?: string[];
  discount: string;
  description?: string;
  amenities?: string[];
  reviews?: Review[];
  reviewCount?: number;
  publishedAt?: string;
  host?: Host;
}

export interface CardProps {
  title: string;
  imageSrc: string;
  price: number;
}

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}
