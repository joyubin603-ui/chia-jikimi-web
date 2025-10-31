import localforage from 'localforage'

localforage.config({ name: 'chia-jikimi' })

export const getPoints = async (): Promise<number> => {
  const points = await localforage.getItem<number>('points')
  return points || 0
}

export const addPoints = async (amount: number) => {
  const current = await getPoints()
  await localforage.setItem('points', current + amount)
}
