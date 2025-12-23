// 替換數據腳本：將現有的動漫和景點替換為新的20部動漫和20個景點
// 運行: node scripts/replaceData.cjs

const { MongoClient, ObjectId } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/?appName=Cluster0';

// 新的20部動漫數據
const newAnimeData = [
  {
    title: '鈴芽之旅',
    titleJP: 'すずめの戸締まり',
    description: '17歲的少女岩戶鈴芽與「閉門師」草太相遇，兩人一起踏上關閉災難之門的旅程。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.7,
    releaseDate: new Date('2022-11-11'),
    genres: ['冒險', '奇幻', '劇情'],
    studio: 'CoMix Wave Films',
    episodes: 1,
    status: 'completed',
  },
  {
    title: '我想吃掉你的胰臟',
    titleJP: '君の膵臓をたべたい',
    description: '沒有名字的少年與患有胰臟疾病的少女山內櫻良相遇，兩人度過最後的時光。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.6,
    releaseDate: new Date('2018-09-01'),
    genres: ['愛情', '劇情', '校園'],
    studio: 'Studio VOLN',
    episodes: 1,
    status: 'completed',
  },
  {
    title: '輝夜姬想讓人告白',
    titleJP: 'かぐや様は告らせたい',
    description: '學生會會長白銀御行與副會長四宮輝夜互相喜歡，但都想讓對方先告白。',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    rating: 4.8,
    releaseDate: new Date('2019-01-12'),
    genres: ['喜劇', '愛情', '校園'],
    studio: 'A-1 Pictures',
    episodes: 37,
    status: 'completed',
  },
  {
    title: '86-不存在的戰區-',
    titleJP: '86-エイティシックス-',
    description: '在無人機戰爭中，被稱為「86」的少年兵與指揮官蕾娜的相遇與成長。',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    rating: 4.7,
    releaseDate: new Date('2021-04-11'),
    genres: ['科幻', '戰爭', '劇情'],
    studio: 'A-1 Pictures',
    episodes: 23,
    status: 'completed',
  },
  {
    title: '奇巧計程車',
    titleJP: 'オッドタクシー',
    description: '計程車司機小戶川與各種乘客的對話，揭露一連串神秘事件。',
    coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
    rating: 4.9,
    releaseDate: new Date('2021-04-06'),
    genres: ['懸疑', '劇情', '黑色幽默'],
    studio: 'P.I.C.S.',
    episodes: 13,
    status: 'completed',
  },
  {
    title: '賽馬娘',
    titleJP: 'ウマ娘 プリティーダービー',
    description: '擁有賽馬靈魂的少女們，為了成為頂尖賽馬娘而努力奔跑的故事。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.6,
    releaseDate: new Date('2018-04-02'),
    genres: ['運動', '喜劇', '日常'],
    studio: 'P.A.WORKS',
    episodes: 13,
    status: 'completed',
  },
  {
    title: 'Re:從零開始的異世界生活',
    titleJP: 'Re:ゼロから始める異世界生活',
    description: '高中生菜月昴被召喚到異世界，獲得「死亡回歸」能力，不斷重來拯救重要的人。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.7,
    releaseDate: new Date('2016-04-04'),
    genres: ['奇幻', '懸疑', '劇情'],
    studio: 'White Fox',
    episodes: 50,
    status: 'completed',
  },
  {
    title: '約定的夢幻島',
    titleJP: '約束のネバーランド',
    description: '孤兒院的11歲孩子們發現自己是被飼養的「食物」，決定逃出這個地獄。',
    coverImage: 'https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=400',
    rating: 4.6,
    releaseDate: new Date('2019-01-10'),
    genres: ['懸疑', '驚悚', '劇情'],
    studio: 'CloverWorks',
    episodes: 23,
    status: 'completed',
  },
  {
    title: 'Dr.STONE 新石紀',
    titleJP: 'ドクターストーン',
    description: '全人類被石化，3700年後天才科學家石神千空醒來，要用科學重建文明。',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    rating: 4.5,
    releaseDate: new Date('2019-07-05'),
    genres: ['科幻', '冒險', '喜劇'],
    studio: 'TMS Entertainment',
    episodes: 35,
    status: 'completed',
  },
  {
    title: '輝夜姬物語',
    titleJP: 'かぐや姫の物語',
    description: '從竹子中誕生的輝夜姬，在人間度過快樂時光，最終必須回到月亮。',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    rating: 4.8,
    releaseDate: new Date('2013-11-23'),
    genres: ['奇幻', '劇情', '歷史'],
    studio: '吉卜力工作室',
    episodes: 1,
    status: 'completed',
  },
  {
    title: '風起',
    titleJP: '風立ちぬ',
    description: '零式戰鬥機設計師堀越二郎的夢想與愛情故事，背景是二戰前的日本。',
    coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
    rating: 4.7,
    releaseDate: new Date('2013-07-20'),
    genres: ['劇情', '歷史', '愛情'],
    studio: '吉卜力工作室',
    episodes: 1,
    status: 'completed',
  },
  {
    title: '借物少女艾莉緹',
    titleJP: '借りぐらしのアリエッティ',
    description: '14歲的小人族少女艾莉緹與人類少年翔的相遇，關於成長與離別的故事。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.6,
    releaseDate: new Date('2010-07-17'),
    genres: ['奇幻', '冒險', '家庭'],
    studio: '吉卜力工作室',
    episodes: 1,
    status: 'completed',
  },
  {
    title: '魔法少女小圓',
    titleJP: '魔法少女まどか☆マギカ',
    description: '初中生鹿目圓與神秘生物QB簽約成為魔法少女，卻發現殘酷的真相。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.9,
    releaseDate: new Date('2011-01-07'),
    genres: ['魔法', '劇情', '黑暗'],
    studio: 'SHAFT',
    episodes: 12,
    status: 'completed',
  },
  {
    title: '命運石之門',
    titleJP: 'シュタインズ・ゲート',
    description: '大學生岡部倫太郎發現可以發送簡訊到過去，改變世界線的故事。',
    coverImage: 'https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=400',
    rating: 4.9,
    releaseDate: new Date('2011-04-06'),
    genres: ['科幻', '懸疑', '劇情'],
    studio: 'White Fox',
    episodes: 24,
    status: 'completed',
  },
  {
    title: 'CLANNAD',
    titleJP: 'クラナド',
    description: '不良少年岡崎朋也在學校遇到少女古河渚，兩人的愛情與家庭故事。',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    rating: 4.8,
    releaseDate: new Date('2007-10-04'),
    genres: ['愛情', '劇情', '校園'],
    studio: '京都動畫',
    episodes: 44,
    status: 'completed',
  },
  {
    title: 'Angel Beats!',
    titleJP: 'エンジェルビーツ！',
    description: '死後世界的學校，音無結弦與「死後世界戰線」成員對抗學生會長天使。',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    rating: 4.6,
    releaseDate: new Date('2010-04-03'),
    genres: ['動作', '喜劇', '劇情'],
    studio: 'P.A.WORKS',
    episodes: 13,
    status: 'completed',
  },
  {
    title: '未聞花名',
    titleJP: 'あの日見た花の名前を僕達はまだ知らない。',
    description: '已故的少女本間芽衣子出現在主角面前，六個童年玩伴重新聚在一起。',
    coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
    rating: 4.7,
    releaseDate: new Date('2011-04-14'),
    genres: ['劇情', '治癒', '超自然'],
    studio: 'A-1 Pictures',
    episodes: 11,
    status: 'completed',
  },
  {
    title: '四月是你的謊言',
    titleJP: '四月は君の嘘',
    description: '鋼琴家公生遇到小提琴手薰，重新找回對音樂的熱情。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.8,
    releaseDate: new Date('2014-10-10'),
    genres: ['音樂', '愛情', '劇情'],
    studio: 'A-1 Pictures',
    episodes: 22,
    status: 'completed',
  },
  {
    title: '3月的獅子',
    titleJP: '3月のライオン',
    description: '17歲的職業將棋棋士桐山零，在失去家人後重新找到生活的意義。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.7,
    releaseDate: new Date('2016-10-08'),
    genres: ['劇情', '治癒', '競技'],
    studio: 'SHAFT',
    episodes: 44,
    status: 'completed',
  },
  {
    title: '比宇宙更遠的地方',
    titleJP: '宇宙よりも遠い場所',
    description: '四個高中女生為了去南極，努力打工賺錢，實現夢想的青春故事。',
    coverImage: 'https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=400',
    rating: 4.8,
    releaseDate: new Date('2018-01-02'),
    genres: ['冒險', '劇情', '青春'],
    studio: 'MADHOUSE',
    episodes: 13,
    status: 'completed',
  },
];

// 新的20個景點數據
const newLocationData = [
  {
    name: '東京車站',
    nameJP: '東京駅',
    description: '《鈴芽之旅》中重要的交通樞紐場景',
    address: '東京都千代田區丸之內1-9-1',
    latitude: 35.6812,
    longitude: 139.7671,
    images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'],
  },
  {
    name: '宮崎駿美術館',
    nameJP: '三鷹の森ジブリ美術館',
    description: '吉卜力動畫的聖地，展示動畫製作過程',
    address: '東京都三鷹市下連雀1-1-83',
    latitude: 35.6962,
    longitude: 139.5703,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
  },
  {
    name: '鎌倉高校前站',
    nameJP: '鎌倉高校前駅',
    description: '《灌籃高手》經典場景，櫻木花道與晴子相遇的平交道',
    address: '神奈川縣鎌倉市七里濱',
    latitude: 35.3089,
    longitude: 139.5503,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  },
  {
    name: '江之島',
    nameJP: '江の島',
    description: '《TARI TARI》等動畫的取景地，美麗的海島風景',
    address: '神奈川縣藤澤市江之島',
    latitude: 35.2996,
    longitude: 139.4817,
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  },
  {
    name: '京都清水寺',
    nameJP: '清水寺',
    description: '《名偵探柯南》等動畫中常出現的京都地標',
    address: '京都府京都市東山區清水1-294',
    latitude: 34.9949,
    longitude: 135.7850,
    images: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=800'],
  },
  {
    name: '伏見稻荷大社',
    nameJP: '伏見稲荷大社',
    description: '《你的名字》等動畫的取景地，著名的千本鳥居',
    address: '京都府京都市伏見區深草藪之內町68',
    latitude: 34.9671,
    longitude: 135.7727,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
  },
  {
    name: '白川鄉合掌村',
    nameJP: '白川郷',
    description: '《寒蟬鳴泣之時》的取景地，世界文化遺產',
    address: '岐阜縣大野郡白川村',
    latitude: 36.2551,
    longitude: 136.9060,
    images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'],
  },
  {
    name: '金閣寺',
    nameJP: '金閣寺',
    description: '京都著名景點，多部動畫的取景地',
    address: '京都府京都市北區金閣寺町1',
    latitude: 35.0394,
    longitude: 135.7299,
    images: ['https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=800'],
  },
  {
    name: '嵐山竹林',
    nameJP: '嵐山竹林の小徑',
    description: '《名偵探柯南》等動畫的取景地，美麗的竹林小徑',
    address: '京都府京都市右京區嵯峨',
    latitude: 35.0167,
    longitude: 135.6783,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  },
  {
    name: '姬路城',
    nameJP: '姫路城',
    description: '日本國寶，多部歷史動畫的參考地',
    address: '兵庫縣姬路市本町68',
    latitude: 34.8394,
    longitude: 134.6939,
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  },
  {
    name: '嚴島神社',
    nameJP: '厳島神社',
    description: '世界文化遺產，海上鳥居的經典場景',
    address: '廣島縣廿日市市宮島町1-1',
    latitude: 34.2958,
    longitude: 132.3197,
    images: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=800'],
  },
  {
    name: '天橋立',
    nameJP: '天橋立',
    description: '日本三景之一，多部動畫的取景地',
    address: '京都府宮津市文珠',
    latitude: 35.5594,
    longitude: 135.1956,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
  },
  {
    name: '箱根溫泉',
    nameJP: '箱根温泉',
    description: '《溫泉屋小女將》等動畫的取景地',
    address: '神奈川縣足柄下郡箱根町',
    latitude: 35.2324,
    longitude: 139.1033,
    images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'],
  },
  {
    name: '奈良公園',
    nameJP: '奈良公園',
    description: '《鹿男》等動畫的取景地，可以與鹿互動',
    address: '奈良縣奈良市雜司町',
    latitude: 34.6851,
    longitude: 135.8400,
    images: ['https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=800'],
  },
  {
    name: '高野山',
    nameJP: '高野山',
    description: '《蟲師》等動畫的靈感來源，神秘的佛教聖地',
    address: '和歌山縣伊都郡高野町',
    latitude: 34.2128,
    longitude: 135.5874,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  },
  {
    name: '熊本城',
    nameJP: '熊本城',
    description: '日本三大名城之一，多部歷史動畫的參考地',
    address: '熊本縣熊本市中央區本丸1-1',
    latitude: 32.8062,
    longitude: 130.7058,
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  },
  {
    name: '太宰府天滿宮',
    nameJP: '太宰府天満宮',
    description: '《你的名字》等動畫的取景地，學問之神',
    address: '福岡縣太宰府市宰府4-7-1',
    latitude: 33.5194,
    longitude: 130.5353,
    images: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=800'],
  },
  {
    name: '角館武家屋敷',
    nameJP: '角館武家屋敷',
    description: '《銀魂》等動畫的參考地，保存完好的武士住宅',
    address: '秋田縣仙北市角館町',
    latitude: 39.5931,
    longitude: 140.5703,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
  },
  {
    name: '函館山',
    nameJP: '函館山',
    description: '《名偵探柯南》等動畫的取景地，世界三大夜景之一',
    address: '北海道函館市函館山',
    latitude: 41.7586,
    longitude: 140.7181,
    images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800'],
  },
  {
    name: '小樽運河',
    nameJP: '小樽運河',
    description: '《情書》等動畫的取景地，浪漫的運河風景',
    address: '北海道小樽市港町',
    latitude: 43.1907,
    longitude: 140.9947,
    images: ['https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=800'],
  },
];

async function replaceData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const animeCollection = db.collection('animes');
    const locationCollection = db.collection('locations');

    // 清除現有數據
    console.log('Clearing existing data...');
    await animeCollection.deleteMany({});
    await locationCollection.deleteMany({});
    console.log('Cleared existing data');

    // 插入新的動漫數據
    console.log('Inserting new anime data...');
    const animeResult = await animeCollection.insertMany(newAnimeData);
    console.log(`Created ${animeResult.insertedCount} anime`);

    // 插入新的景點數據並連結到動漫
    console.log('Inserting new location data...');
    const animeIds = Object.values(animeResult.insertedIds);
    
    for (let i = 0; i < newLocationData.length; i++) {
      const location = {
        ...newLocationData[i],
        anime: animeIds[i % animeIds.length], // 循環分配景點到動漫
        userPhotos: [],
        rating: 0,
      };
      
      const locResult = await locationCollection.insertOne(location);
      
      // 將景點連結到動漫
      await animeCollection.updateOne(
        { _id: animeIds[i % animeIds.length] },
        { $push: { locations: locResult.insertedId } }
      );
    }

    console.log(`Created ${newLocationData.length} locations`);
    console.log('Data replacement completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Anime: ${animeResult.insertedCount} entries`);
    console.log(`- Locations: ${newLocationData.length} entries`);
  } catch (error) {
    console.error('Error replacing data:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

replaceData();

