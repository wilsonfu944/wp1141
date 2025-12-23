// 使用 Node.js 运行此脚本来初始化数据
// 运行: node scripts/initData.js

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wilsonfu944:Aa101130091512@cluster0.vyqhg04.mongodb.net/?appName=Cluster0';

const animeData = [
  {
    title: '你的名字',
    titleJP: '君の名は。',
    description: '住在东京的高中生立花泷和住在乡下的女高中生宫水三叶，在梦中交换身体，体验彼此的生活。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.8,
    releaseDate: new Date('2016-08-26'),
    genres: ['爱情', '奇幻', '剧情'],
    studio: 'CoMix Wave Films',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '天气之子',
    titleJP: '天気の子',
    description: '高中生森嶋帆高离家出走来到东京，遇到拥有改变天气能力的少女天野阳菜。',
    coverImage: 'https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=400',
    rating: 4.5,
    releaseDate: new Date('2019-07-19'),
    genres: ['爱情', '奇幻', '剧情'],
    studio: 'CoMix Wave Films',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '秒速五厘米',
    titleJP: '秒速5センチメートル',
    description: '远野贵树和篠原明里从小一起长大，因转学而分离，长大后再次相遇的故事。',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    rating: 4.6,
    releaseDate: new Date('2007-03-03'),
    genres: ['爱情', '剧情'],
    studio: 'CoMix Wave Films',
    episodes: 3,
    status: 'completed',
    locations: [],
  },
  {
    title: '千与千寻',
    titleJP: '千と千尋の神隠し',
    description: '10岁的荻野千寻和父母误入神秘世界，为了救回变成猪的父母，在汤屋工作的冒险故事。',
    coverImage: 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=400',
    rating: 4.9,
    releaseDate: new Date('2001-07-20'),
    genres: ['奇幻', '冒险', '家庭'],
    studio: '吉卜力工作室',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '龙猫',
    titleJP: 'となりのトトロ',
    description: '草壁达郎的妻子生病住院，他带着两个女儿搬到乡下，遇到了森林守护者龙猫。',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    rating: 4.8,
    releaseDate: new Date('1988-04-16'),
    genres: ['奇幻', '家庭', '冒险'],
    studio: '吉卜力工作室',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '哈尔的移动城堡',
    titleJP: 'ハウルの動く城',
    description: '被施了魔法变成老太婆的苏菲，遇到了魔法师哈尔，住进了会移动的城堡。',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    rating: 4.7,
    releaseDate: new Date('2004-11-20'),
    genres: ['奇幻', '爱情', '冒险'],
    studio: '吉卜力工作室',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '言叶之庭',
    titleJP: '言の葉の庭',
    description: '15岁的高中生秋月孝雄在雨天的公园里遇到了27岁的雪野百香里，两人逐渐靠近。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.4,
    releaseDate: new Date('2013-05-31'),
    genres: ['爱情', '剧情'],
    studio: 'CoMix Wave Films',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '萤火之森',
    titleJP: '蛍火の杜へ',
    description: '6岁的竹川萤在爷爷家附近的森林里迷路，遇到了戴着狐狸面具的少年银。',
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
    rating: 4.6,
    releaseDate: new Date('2011-09-17'),
    genres: ['爱情', '奇幻', '剧情'],
    studio: 'Brain\'s Base',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '夏日大作战',
    titleJP: 'サマーウォーズ',
    description: '高中生小矶健二被学姐篠原夏希邀请去她家，卷入了一场虚拟世界的战斗。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.5,
    releaseDate: new Date('2009-08-01'),
    genres: ['科幻', '冒险', '剧情'],
    studio: 'Madhouse',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '狼的孩子雨和雪',
    titleJP: 'おおかみこどもの雨と雪',
    description: '大学生花爱上狼男，生下两个孩子雨和雪，独自抚养他们长大的故事。',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    rating: 4.7,
    releaseDate: new Date('2012-07-21'),
    genres: ['家庭', '奇幻', '剧情'],
    studio: 'Studio Chizu',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '声之形',
    titleJP: '聲の形',
    description: '小学时欺负听障同学的石田将也，长大后想要赎罪，重新与西宫硝子相遇。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.5,
    releaseDate: new Date('2016-09-17'),
    genres: ['剧情', '校园', '成长'],
    studio: '京都动画',
    episodes: 1,
    status: 'completed',
    locations: [],
  },
  {
    title: '紫罗兰永恒花园',
    titleJP: 'ヴァイオレット・エヴァーガーデン',
    description: '曾是军人的薇尔莉特成为自动手记人偶，通过代笔书信了解感情的故事。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.6,
    releaseDate: new Date('2018-01-10'),
    genres: ['剧情', '治愈'],
    studio: '京都动画',
    episodes: 13,
    status: 'completed',
    locations: [],
  },
  {
    title: '进击的巨人',
    titleJP: '進撃の巨人',
    description: '人类被巨人威胁，生活在高墙内。少年艾伦目睹母亲被巨人吃掉，立志消灭所有巨人。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.9,
    releaseDate: new Date('2013-04-07'),
    genres: ['动作', '悬疑', '剧情'],
    studio: 'WIT Studio',
    episodes: 75,
    status: 'completed',
    locations: [],
  },
  {
    title: '鬼灭之刃',
    titleJP: '鬼滅の刃',
    description: '大正时代，卖炭少年炭治郎的家人被鬼杀害，妹妹祢豆子变成鬼，他为了救妹妹成为鬼杀队队员。',
    coverImage: 'https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=400',
    rating: 4.8,
    releaseDate: new Date('2019-04-06'),
    genres: ['动作', '超自然', '历史'],
    studio: 'ufotable',
    episodes: 44,
    status: 'completed',
    locations: [],
  },
  {
    title: '咒术回战',
    titleJP: '呪術廻戦',
    description: '高中生虎杖悠仁吞下特级咒物，成为宿傩的容器，进入东京都立咒术高等专门学校学习。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.7,
    releaseDate: new Date('2020-10-03'),
    genres: ['动作', '超自然', '校园'],
    studio: 'MAPPA',
    episodes: 24,
    status: 'completed',
    locations: [],
  },
  {
    title: '间谍过家家',
    titleJP: 'SPY×FAMILY',
    description: '间谍黄昏为了任务组建假家庭，与杀手约尔和超能力者阿尼亚一起生活的温馨故事。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.8,
    releaseDate: new Date('2022-04-09'),
    genres: ['喜剧', '动作', '家庭'],
    studio: 'WIT Studio / CloverWorks',
    episodes: 25,
    status: 'completed',
    locations: [],
  },
  {
    title: '孤独摇滚！',
    titleJP: 'ぼっち・ざ・ろっく！',
    description: '孤独的高中生后藤一里加入轻音部，与伙伴们一起玩音乐的故事。',
    coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    rating: 4.6,
    releaseDate: new Date('2022-10-09'),
    genres: ['音乐', '喜剧', '校园'],
    studio: 'CloverWorks',
    episodes: 12,
    status: 'completed',
    locations: [],
  },
  {
    title: '链锯人',
    titleJP: 'チェンソーマン',
    description: '少年电次与链锯恶魔波奇塔融合，成为链锯人，加入公安对魔特异4课。',
    coverImage: 'https://images.unsplash.com/photo-1601297183305-6df1426890e8?w=400',
    rating: 4.5,
    releaseDate: new Date('2022-10-11'),
    genres: ['动作', '超自然', '黑暗'],
    studio: 'MAPPA',
    episodes: 12,
    status: 'completed',
    locations: [],
  },
  {
    title: '葬送的芙莉莲',
    titleJP: '葬送のフリーレン',
    description: '精灵魔法师芙莉莲与勇者一行打败魔王后，重新踏上旅程，了解人类感情的故事。',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400',
    rating: 4.9,
    releaseDate: new Date('2023-09-29'),
    genres: ['奇幻', '冒险', '治愈'],
    studio: 'Madhouse',
    episodes: 28,
    status: 'ongoing',
    locations: [],
  },
];

const locationData = [
  {
    name: '新宿御苑',
    nameJP: '新宿御苑',
    description: '《你的名字》中三叶和泷最后相遇的地方',
    address: '东京都新宿区内藤町11',
    latitude: 35.6852,
    longitude: 139.7103,
    images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800'],
  },
  {
    name: '代代木站',
    nameJP: '代々木駅',
    description: '《你的名字》中重要的场景',
    address: '东京都涩谷区代代木',
    latitude: 35.6833,
    longitude: 139.7022,
    images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'],
  },
  {
    name: '须贺神社',
    nameJP: '須賀神社',
    description: '《你的名字》中著名的楼梯场景',
    address: '东京都新宿区须贺町5',
    latitude: 35.6828,
    longitude: 139.7142,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'],
  },
  {
    name: '六本木Hills',
    nameJP: '六本木ヒルズ',
    description: '《天气之子》中的场景',
    address: '东京都港区六本木6-10-1',
    latitude: 35.6604,
    longitude: 139.7292,
    images: ['https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800'],
  },
  {
    name: '东京晴空塔',
    nameJP: '東京スカイツリー',
    description: '《天气之子》中的重要地标',
    address: '东京都墨田区押上1-1-2',
    latitude: 35.7101,
    longitude: 139.8107,
    images: ['https://images.unsplash.com/photo-1528164344705-47542687000d?w=800'],
  },
];

async function initData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const animeCollection = db.collection('animes');
    const locationCollection = db.collection('locations');

    // Clear existing data
    await animeCollection.deleteMany({});
    await locationCollection.deleteMany({});
    console.log('Cleared existing data');

    // Insert anime
    const animeResult = await animeCollection.insertMany(animeData);
    console.log(`Created ${animeResult.insertedCount} anime`);

    // Insert locations and link to anime
    const animeIds = Object.values(animeResult.insertedIds);
    for (let i = 0; i < locationData.length; i++) {
      const location = {
        ...locationData[i],
        anime: animeIds[i % animeIds.length],
        userPhotos: [],
      };
      const locResult = await locationCollection.insertOne(location);
      
      // Link location to anime
      await animeCollection.updateOne(
        { _id: animeIds[i % animeIds.length] },
        { $push: { locations: locResult.insertedId } }
      );
    }

    console.log(`Created ${locationData.length} locations`);
    console.log('Initial data created successfully!');
  } catch (error) {
    console.error('Error initializing data:', error);
  } finally {
    await client.close();
  }
}

initData();

