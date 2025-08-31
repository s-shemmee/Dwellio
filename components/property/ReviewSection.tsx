import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Review {
  id: number;
  comment: string;
}

interface ReviewSectionProps {
  propertyId: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ propertyId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/properties/${propertyId}/reviews`);
        setReviews(response.data);
      } catch {
        setError('Error fetching reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [propertyId]);

  if (loading) {
    return <p className="py-4">Loading reviews...</p>;
  }
  if (error) {
    return <p className="py-4 text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} className="p-4 bg-gray-100 rounded">
            <p>{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewSection;
