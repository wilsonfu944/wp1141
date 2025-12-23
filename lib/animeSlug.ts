// 統一的動漫標題到 slug 映射（像導航欄按鈕一樣固定）
// 所有地方都使用這個映射，確保一致性

export const titleToSlug: Record<string, string> = {
  '鈴芽之旅': 'suzume',
  '我想吃掉你的胰臟': 'pancreas',
  '輝夜姬想讓人告白': 'kaguya',
  '86-不存在的戰區-': 'eighty-six',
  '奇巧計程車': 'odd-taxi',
  '賽馬娘': 'uma-musume',
  'Re:從零開始的異世界生活': 're-zero',
  '約定的夢幻島': 'promised-neverland',
  'Dr.STONE 新石紀': 'dr-stone',
  '輝夜姬物語': 'tale-of-princess',
  '風起': 'wind-rises',
  '借物少女艾莉緹': 'arrietty',
  '魔法少女小圓': 'madoka',
  '命運石之門': 'steins-gate',
  'CLANNAD': 'clannad',
  'Angel Beats!': 'angel-beats',
  '未聞花名': 'anohana',
  '四月是你的謊言': 'your-lie',
  '3月的獅子': 'march-lion',
  '比宇宙更遠的地方': 'a-place-further',
};

// 根據標題獲取 slug（像導航欄按鈕一樣）
export function getAnimeSlug(title: string): string {
  return titleToSlug[title] || title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '-');
}

