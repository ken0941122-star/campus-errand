import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  TASKS: 'campus_errand_tasks',
  ORDERS: 'campus_errand_orders',
  REVIEWS: 'campus_errand_reviews',
  USER: 'campus_errand_user',
};

export async function clearAllStorage() {
  try {
    await AsyncStorage.multiRemove(Object.values(KEYS));
    console.log('✅ Storage cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing storage:', error);
  }
}
