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
  reviews?: { id: number; comment: string }[];
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
