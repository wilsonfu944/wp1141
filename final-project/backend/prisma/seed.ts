import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清除現有資料（按順序清除，避免外鍵約束錯誤）
  await prisma.commentPhoto.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.itineraryComment.deleteMany();
  await prisma.itineraryLike.deleteMany();
  await prisma.itineraryItem.deleteMany();
  await prisma.itinerary.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.location.deleteMany();
  await prisma.anime.deleteMany();
  await prisma.user.deleteMany();

  console.log('開始建立種子資料...');

  // 1. 孤獨搖滾！
  const bocchi = await prisma.anime.create({
    data: {
      name: '孤獨搖滾！',
      nameEn: 'Bocchi the Rock!',
      year: 2022,
      genre: '音樂、喜劇',
      description: '講述內向的高中生後藤一里加入樂團的故事，以東京下北澤為主要舞台。',
      coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
      locations: {
        create: [
          {
            name: '下北澤站前',
            latitude: 35.6617,
            longitude: 139.6669,
            address: '東京都世田谷區北澤2-1-1',
            episode: '第1話',
            animeImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            realImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            description: '主角後藤一里經常經過的車站',
          },
          {
            name: '下北澤商店街',
            latitude: 35.6615,
            longitude: 139.6675,
            address: '東京都世田谷區北澤2-36',
            episode: '第1話',
            animeImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            realImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
            description: '樂團成員們經常活動的商店街',
          },
          {
            name: 'STARRY Live House',
            latitude: 35.6620,
            longitude: 139.6680,
            address: '東京都世田谷區北澤2-10-15',
            episode: '第2話',
            animeImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
            realImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
            description: '故事中重要的 Live House 場景',
          },
        ],
      },
    },
  });

  // 2. 你的名字
  const yourName = await prisma.anime.create({
    data: {
      name: '你的名字',
      nameEn: 'Your Name',
      year: 2016,
      genre: '愛情、奇幻',
      description: '新海誠執導的動畫電影，講述兩個互換身體的少男少女的故事。',
      coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
      locations: {
        create: [
          {
            name: '須賀神社',
            latitude: 35.6762,
            longitude: 139.6503,
            address: '東京都新宿區須賀町5',
            episode: '結局場景',
            animeImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
            realImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800',
            description: '電影結尾的重要場景，階梯前相遇',
          },
          {
            name: '諏訪湖',
            latitude: 36.0706,
            longitude: 138.0806,
            address: '長野縣諏訪市',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            realImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: '故事發生的主要地點，糸守町的原型',
          },
          {
            name: '國立新美術館',
            latitude: 35.6651,
            longitude: 139.7264,
            address: '東京都港區六本木7-22-2',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            realImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
            description: '電影中出現的現代建築',
          },
        ],
      },
    },
  });

  // 3. 天氣之子
  const weathering = await prisma.anime.create({
    data: {
      name: '天氣之子',
      nameEn: 'Weathering With You',
      year: 2019,
      genre: '愛情、奇幻',
      description: '新海誠執導的動畫電影，以東京為舞台的奇幻愛情故事。',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      locations: {
        create: [
          {
            name: '代代木會館',
            latitude: 35.6709,
            longitude: 139.7027,
            address: '東京都澀谷區代代木2-1-1',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            realImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            description: '主角居住的大樓',
          },
          {
            name: '新宿警察署',
            latitude: 35.6938,
            longitude: 139.7034,
            address: '東京都新宿區新宿3-1-1',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
            realImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800',
            description: '電影中的重要場景',
          },
          {
            name: '六本木之丘展望台',
            latitude: 35.6586,
            longitude: 139.7294,
            address: '東京都港區六本木6-10-1',
            episode: '結局場景',
            animeImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            realImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            description: '電影結尾的重要場景',
          },
        ],
      },
    },
  });

  // 4. 鈴芽之旅
  const suzume = await prisma.anime.create({
    data: {
      name: '鈴芽之旅',
      nameEn: 'Suzume',
      year: 2022,
      genre: '奇幻、冒險',
      description: '新海誠執導的動畫電影，講述少女鈴芽的日本各地旅行。',
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      locations: {
        create: [
          {
            name: '宮崎縣日南市',
            latitude: 31.6000,
            longitude: 131.3667,
            address: '宮崎縣日南市',
            episode: '開場場景',
            animeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            realImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: '故事開始的九州小鎮',
          },
          {
            name: '愛媛縣今治市',
            latitude: 34.0667,
            longitude: 132.9833,
            address: '愛媛縣今治市',
            episode: '中段場景',
            animeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            realImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: '鈴芽旅途中經過的城市',
          },
          {
            name: '東京站',
            latitude: 35.6812,
            longitude: 139.7671,
            address: '東京都千代田區丸之內1',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
            realImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
            description: '鈴芽前往東京的重要車站',
          },
        ],
      },
    },
  });

  // 5. 進擊的巨人
  const aot = await prisma.anime.create({
    data: {
      name: '進擊的巨人',
      nameEn: 'Attack on Titan',
      year: 2013,
      genre: '動作、劇情',
      description: '人類與巨人之間的生存戰爭，以德國建築為靈感的場景設計。',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      locations: {
        create: [
          {
            name: '德國哈茨山脈',
            latitude: 51.7592,
            longitude: 10.3333,
            address: '德國哈茨山脈',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            realImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: '動畫中城牆的靈感來源',
          },
          {
            name: '德國羅滕堡',
            latitude: 49.3780,
            longitude: 10.1790,
            address: '德國羅滕堡',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            realImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            description: '動畫中城鎮的建築靈感來源',
          },
        ],
      },
    },
  });

  // 6. 鬼滅之刃
  const demonSlayer = await prisma.anime.create({
    data: {
      name: '鬼滅之刃',
      nameEn: 'Demon Slayer',
      year: 2019,
      genre: '動作、奇幻',
      description: '大正時代的日本，講述炭治郎與鬼戰鬥的故事。',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      locations: {
        create: [
          {
            name: '足利花卉公園',
            latitude: 36.5500,
            longitude: 139.5167,
            address: '栃木縣足利市迫間町607',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            realImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: '無限列車篇的靈感來源地',
          },
          {
            name: '淺草寺',
            latitude: 35.7148,
            longitude: 139.7967,
            address: '東京都台東區淺草2-3-1',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            realImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            description: '動畫中出現的傳統寺廟場景',
          },
          {
            name: '奧日光',
            latitude: 36.7500,
            longitude: 139.5000,
            address: '栃木縣日光市',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            realImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: '動畫中自然場景的靈感來源',
          },
        ],
      },
    },
  });

  // 7. 咒術迴戰
  const jujutsu = await prisma.anime.create({
    data: {
      name: '咒術迴戰',
      nameEn: 'Jujutsu Kaisen',
      year: 2020,
      genre: '動作、超自然',
      description: '現代東京的咒術師與詛咒戰鬥的故事。',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      locations: {
        create: [
          {
            name: '東京咒術高專（原型：明治神宮）',
            latitude: 35.6762,
            longitude: 139.6993,
            address: '東京都澀谷區代代木神園町1-1',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            realImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            description: '咒術高專的靈感來源',
          },
          {
            name: '新宿站',
            latitude: 35.6896,
            longitude: 139.7006,
            address: '東京都新宿區新宿3-38-1',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
            realImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
            description: '動畫中經常出現的車站場景',
          },
          {
            name: '澀谷十字路口',
            latitude: 35.6598,
            longitude: 139.7006,
            address: '東京都澀谷區道玄坂1-2-3',
            episode: '澀谷事變',
            animeImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            realImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            description: '澀谷事變的重要場景',
          },
        ],
      },
    },
  });

  // 8. 間諜家家酒
  const spyFamily = await prisma.anime.create({
    data: {
      name: 'SPY×FAMILY 間諜家家酒',
      nameEn: 'Spy x Family',
      year: 2022,
      genre: '喜劇、動作',
      description: '間諜、殺手和超能力者組成的假家庭，以虛構的東歐國家為背景。',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      locations: {
        create: [
          {
            name: '德國柏林（靈感來源）',
            latitude: 52.5200,
            longitude: 13.4050,
            address: '德國柏林',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            realImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            description: '動畫中東歐風格的建築靈感來源',
          },
          {
            name: '法國斯特拉斯堡（靈感來源）',
            latitude: 48.5734,
            longitude: 7.7521,
            address: '法國斯特拉斯堡',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            realImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
            description: '動畫中城市景觀的靈感來源',
          },
        ],
      },
    },
  });

  // 9. 鏈鋸人
  const chainsaw = await prisma.anime.create({
    data: {
      name: '鏈鋸人',
      nameEn: 'Chainsaw Man',
      year: 2022,
      genre: '動作、黑暗奇幻',
      description: '惡魔獵人與惡魔戰鬥的故事，以現代日本為背景。',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      locations: {
        create: [
          {
            name: '東京街頭（多處）',
            latitude: 35.6762,
            longitude: 139.6503,
            address: '東京都新宿區',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            realImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            description: '動畫中現代都市場景的靈感來源',
          },
          {
            name: '澀谷區',
            latitude: 35.6598,
            longitude: 139.7006,
            address: '東京都澀谷區',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            realImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            description: '動畫中都市戰鬥場景的靈感來源',
          },
        ],
      },
    },
  });

  // 10. 我推的孩子
  const oshiNoKo = await prisma.anime.create({
    data: {
      name: '【我推的孩子】',
      nameEn: 'Oshi no Ko',
      year: 2023,
      genre: '劇情、偶像',
      description: '講述演藝圈和偶像文化的現實故事，以東京為主要舞台。',
      coverImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400',
      locations: {
        create: [
          {
            name: '東京巨蛋',
            latitude: 35.7058,
            longitude: 139.7517,
            address: '東京都文京區後樂1-3-61',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            realImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            description: '動畫中演唱會場景的靈感來源',
          },
          {
            name: '秋葉原',
            latitude: 35.6984,
            longitude: 139.7731,
            address: '東京都千代田區外神田',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            realImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            description: '動畫中偶像文化場景的靈感來源',
          },
          {
            name: '六本木新城',
            latitude: 35.6586,
            longitude: 139.7294,
            address: '東京都港區六本木6-10-1',
            episode: '多處場景',
            animeImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            realImage: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800',
            description: '動畫中現代都市場景的靈感來源',
          },
        ],
      },
    },
  });

  // 計算總地點數量
  const totalLocations = await prisma.location.count();
  
  console.log('✅ 種子資料建立成功！');
  console.log('📊 已建立動畫數量: 10');
  console.log('📍 已建立地點數量:', totalLocations);
  console.log('\n動畫列表:');
  console.log('1. 孤獨搖滾！');
  console.log('2. 你的名字');
  console.log('3. 天氣之子');
  console.log('4. 鈴芽之旅');
  console.log('5. 進擊的巨人');
  console.log('6. 鬼滅之刃');
  console.log('7. 咒術迴戰');
  console.log('8. SPY×FAMILY 間諜家家酒');
  console.log('9. 鏈鋸人');
  console.log('10. 【我推的孩子】');
}

main()
  .catch((e) => {
    console.error('❌ 種子資料建立失敗:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
