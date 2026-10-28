import { RestaurantCard } from '@/components/RestaurantCard';
import { loadRestaurants } from '@/services/restaurants';
import styles from './page.module.css';

export default function HomePage() {
  const restaurants = loadRestaurants();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Game-day restaurants</h1>
        <p className={styles.count}>{restaurants.length} restaurants</p>
      </header>
      <ul className={styles.grid}>
        {restaurants.map((restaurant) => (
          <li key={restaurant.id} className={styles.cell}>
            <RestaurantCard restaurant={restaurant} />
          </li>
        ))}
      </ul>
    </main>
  );
}
