import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 清除現有資料（按順序清除，避免外鍵約束錯誤）
  await prisma.commentPhoto.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.location.deleteMany();
  await prisma.anime.deleteMany();
  await prisma.user.deleteMany();

  // 建立動畫
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

  const kimiNoNaWa = await prisma.anime.create({
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
        ],
      },
    },
  });

  console.log('Seed data created successfully!');
  console.log('Created animes:', { bocchi, yourName, weathering, kimiNoNaWa });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

