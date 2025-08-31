import { useRouter } from 'next/router';
import axios from 'axios';
import { useState, useEffect } from 'react';
import PropertyDetail from '@/components/property/PropertyDetail';
import { PropertyProps } from '@/interfaces/index';

export default function PropertyDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [property, setProperty] = useState<PropertyProps | null>(null);
  const [loading, setLoading] = useState(true);
  // Removed unused error variable

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`/api/properties/${id}`);
        setProperty(response.data);
      } catch {
        // Optionally handle error here
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  if (loading) {
    return <p className="py-10 text-center">Loading...</p>;
  }

  if (!property) {
    return <p className="py-10 text-center text-red-500">Property not found</p>;
  }

  return <PropertyDetail property={property} />;
}
