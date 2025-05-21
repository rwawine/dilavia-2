"use client"

import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import styles from './reviews.module.css';

interface Review {
  id: string;
  username: string;
  comment: string;
  rating: number;
  timestamp: Timestamp;
}

export default function ReviewsPage() {
  const [username, setUsername] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'feedbacks'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !comment || rating === 0) {
      alert('Пожалуйста, заполните все поля и выберите рейтинг!');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedbacks'), {
        username,
        comment,
        rating,
        timestamp: Timestamp.now()
      });

      setUsername('');
      setComment('');
      setRating(0);
    } catch (error) {
      console.error('Ошибка при добавлении отзыва:', error);
      alert('Ошибка при отправке. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Отзывы</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Оставьте отзыв</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ваше имя"
          required
          className={styles.input}
        />
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Ваш отзыв"
          required
          className={styles.textarea}
        />
        
        <div className={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`${styles.star} ${star <= rating ? styles.selected : ''}`}
              aria-label={`Оценить на ${star} из 5`}
            >
              ★
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? 'Отправка...' : 'Отправить отзыв'}
        </button>
      </form>

      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.review}>
            <div className={styles.reviewHeader}>
              <strong>{review.username}</strong>
              <small>
                {review.timestamp.toDate().toLocaleString('ru-RU')}
              </small>
            </div>
            <div className={styles.rating}>
              {'★'.repeat(review.rating)}
              {'☆'.repeat(5 - review.rating)}
            </div>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 