import localforage from 'localforage';

localforage.config({ name: 'chia-jikimi' });

export const getPoints = async (): Promise<number> => {
  const points = await localforage.getItem<number>('points');
  return points ?? 0;
};

export const addPoints = async (amount: number): Promise<void> => {
  const current = await getPoints();
  await localforage.setItem('points', current + amount);
  // 히스토리 업데이트 (간단 배열)
  const history = await localforage.getItem<number[]>('history') ?? [];
  history.push(current + amount);
  await localforage.setItem('history', history.slice(-7));  // 최근 7일
};

export const getBadges = async (): Promise<string[]> => {
  return await localforage.getItem<string[]>('badges') ?? [];
};
