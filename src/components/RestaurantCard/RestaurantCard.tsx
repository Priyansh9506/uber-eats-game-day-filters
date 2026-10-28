import type { Restaurant } from '@/types/restaurant';
import styles from './RestaurantCard.module.css';

type DietaryTag = { label: string; applies: (r: Restaurant) => boolean };

const DIETARY_TAGS: readonly DietaryTag[] = [
  { label: 'Vegetarian', applies: (r) => r.isVegetarian },
  { label: 'Vegan', applies: (r) => r.isVegan },
  { label: 'Gluten-free', applies: (r) => r.isGlutenFree },
];

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const { name, cuisine, priceBand, rating, deliveryTimeMin } = restaurant;
  const tags = DIETARY_TAGS.filter((tag) => tag.applies(restaurant));
  const ratingText = rating.toFixed(1);

  return (
    <article className={styles.card}>
      <h2 className={styles.name}>{name}</h2>
      <p className={styles.meta}>
        {cuisine}
        <span className={styles.separator} aria-hidden="true">·</span>
        <span aria-label={`Price ${priceBand.length} of 4`}>{priceBand}</span>
      </p>
      <p className={styles.stats}>
        <span className={styles.rating} aria-label={`Rated ${ratingText} out of 5`}>
          ★ {ratingText}
        </span>
        <span className={styles.dot} aria-hidden="true">·</span>
        <span className={styles.time}>{deliveryTimeMin} min</span>
      </p>
      {tags.length > 0 && (
        <ul className={styles.tags} aria-label="Dietary options">
          {tags.map((tag) => (
            <li key={tag.label} className={styles.tag}>
              {tag.label}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
