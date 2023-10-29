import { prefectures } from '@/utils/contents/prefecture'

export const findPrefecture = (value: string) =>
  prefectures.find((prefecture) => prefecture.value === value)
