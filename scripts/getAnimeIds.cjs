// 獲取所有動漫的 ID 和標題，用於硬編碼到靜態頁面
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/?appName=Cluster0';

async function getAnimeIds() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('animes');
    
    const animeList = await collection.find({}).toArray();
    
    console.log('\n=== 動漫 ID 映射表 ===\n');
    animeList.forEach((anime, index) => {
      console.log(`${index + 1}. ${anime.title}`);
      console.log(`   ID: ${anime._id}`);
      console.log(`   Slug: ${getSlug(anime.title)}\n`);
    });
    
    // 生成映射對象
    const mapping = {};
    animeList.forEach(anime => {
      const slug = getSlug(anime.title);
      mapping[slug] = {
        id: anime._id.toString(),
        title: anime.title
      };
    });
    
    console.log('\n=== 映射對象（複製到代碼中）===\n');
    console.log(JSON.stringify(mapping, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

function getSlug(title) {
  const slugMap = {
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
  return slugMap[title] || title.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '-');
}

getAnimeIds();

