import connectDB from '../lib/mongodb';
import Quiz from '../models/Quiz';

const quizData = [
  {
    title: '新海诚作品知识王',
    description: '测试你对新海诚导演作品的了解程度',
    difficulty: 'easy',
    questions: [
      {
        question: '《你的名字》中，三叶和泷最后在哪里相遇？',
        options: ['新宿御苑', '代代木站', '须贺神社', '东京塔'],
        correctAnswer: 2,
        explanation: '须贺神社的楼梯是《你的名字》中最经典的场景之一。',
      },
      {
        question: '《天气之子》中，阳菜拥有什么特殊能力？',
        options: ['控制时间', '改变天气', '预知未来', '心灵感应'],
        correctAnswer: 1,
        explanation: '天野阳菜是"晴女"，拥有让天空放晴的能力。',
      },
      {
        question: '《言叶之庭》的故事发生在哪个季节？',
        options: ['春天', '夏天', '秋天', '雨季'],
        correctAnswer: 3,
        explanation: '故事以雨季为背景，雨天的公园是重要的场景。',
      },
      {
        question: '《秒速五厘米》中，樱花飘落的速度是多少？',
        options: ['每秒3厘米', '每秒5厘米', '每秒7厘米', '每秒10厘米'],
        correctAnswer: 1,
        explanation: '标题就说明了樱花飘落的速度是每秒5厘米。',
      },
    ],
  },
  {
    title: '吉卜力工作室经典',
    description: '宫崎骏和吉卜力工作室的经典作品',
    difficulty: 'medium',
    questions: [
      {
        question: '《千与千寻》中，千寻的父母因为什么变成了猪？',
        options: ['吃了神的食物', '被诅咒', '中了魔法', '被妖怪抓走'],
        correctAnswer: 0,
        explanation: '千寻的父母因为吃了神的食物而变成了猪。',
      },
      {
        question: '《龙猫》中，龙猫帮助小梅和小月做了什么？',
        options: ['找到妈妈', '种树', '找到回家的路', '打败坏人'],
        correctAnswer: 1,
        explanation: '龙猫帮助她们让橡树种子快速长大。',
      },
      {
        question: '《哈尔的移动城堡》中，苏菲被施了什么魔法？',
        options: ['变成小孩', '变成老太婆', '失去声音', '失去记忆'],
        correctAnswer: 1,
        explanation: '荒野女巫将苏菲变成了90岁的老太婆。',
      },
      {
        question: '《千与千寻》中，白龙的真实身份是什么？',
        options: ['人类', '河神', '龙神', '妖怪'],
        correctAnswer: 1,
        explanation: '白龙是琥珀川的河神，真名是"赈早见琥珀主"。',
      },
      {
        question: '《龙猫》的故事发生在哪个时代？',
        options: ['昭和30年代', '昭和40年代', '昭和50年代', '平成年代'],
        correctAnswer: 0,
        explanation: '故事设定在1950年代的日本。',
      },
    ],
  },
  {
    title: '热门动漫知识挑战',
    description: '测试你对热门动漫的了解',
    difficulty: 'hard',
    questions: [
      {
        question: '《进击的巨人》中，艾伦的最终目标是什么？',
        options: ['消灭所有巨人', '保护人类', '获得自由', '成为最强'],
        correctAnswer: 2,
        explanation: '艾伦一直追求的是自由，这是贯穿全剧的主题。',
      },
      {
        question: '《鬼灭之刃》中，炭治郎的妹妹祢豆子为什么变成鬼后还能保持人性？',
        options: ['意志力强大', '没有吃人', '特殊体质', '家族血统'],
        correctAnswer: 1,
        explanation: '祢豆子因为从未吃过人，所以保持了人性。',
      },
      {
        question: '《咒术回战》中，虎杖悠仁吞下的特级咒物是什么？',
        options: ['宿傩的手指', '宿傩的心脏', '宿傩的眼睛', '宿傩的大脑'],
        correctAnswer: 0,
        explanation: '虎杖吞下的是两面宿傩的20根手指之一。',
      },
      {
        question: '《间谍过家家》中，黄昏的真实身份是什么？',
        options: ['间谍', '杀手', '警察', '特工'],
        correctAnswer: 0,
        explanation: '黄昏是西国最强的间谍，代号"黄昏"。',
      },
      {
        question: '《葬送的芙莉莲》中，芙莉莲是什么种族？',
        options: ['人类', '精灵', '魔族', '矮人'],
        correctAnswer: 1,
        explanation: '芙莉莲是精灵族，拥有非常长的寿命。',
      },
      {
        question: '《我推的孩子》中，星野爱有几个孩子？',
        options: ['1个', '2个', '3个', '4个'],
        correctAnswer: 1,
        explanation: '星野爱生下了双胞胎阿库亚和露比。',
      },
      {
        question: '《86-不存在的战区-》中，86区的人被称为什么？',
        options: ['处理单元', '战斗单位', '无人兵器', '消耗品'],
        correctAnswer: 0,
        explanation: '86区的人被称为"处理单元"，被当作无人兵器使用。',
      },
    ],
  },
  {
    title: '动漫基础知识',
    description: '动漫术语和基础知识',
    difficulty: 'easy',
    questions: [
      {
        question: '动画制作中，一集通常有多少分钟？',
        options: ['20分钟', '30分钟', '45分钟', '60分钟'],
        correctAnswer: 0,
        explanation: '日本动画一集通常是24分钟左右（含广告）。',
      },
      {
        question: '什么是"OVA"？',
        options: ['原创动画', '原创视频动画', '在线视频动画', '官方视频动画'],
        correctAnswer: 1,
        explanation: 'OVA是Original Video Animation的缩写，指直接发行影碟的动画。',
      },
      {
        question: '动画制作中，"原画"指的是什么？',
        options: ['原始设计', '关键帧', '背景图', '分镜图'],
        correctAnswer: 1,
        explanation: '原画是动画制作中的关键帧，由原画师绘制。',
      },
      {
        question: '什么是"番剧"？',
        options: ['连续剧', '动画连续剧', '特别篇', '剧场版'],
        correctAnswer: 1,
        explanation: '番剧是日本动画连续剧的俗称。',
      },
    ],
  },
];

async function seedQuiz() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing quiz data
    await Quiz.deleteMany({});
    console.log('Cleared existing quiz data');

    // Create quizzes
    const createdQuizzes = await Quiz.insertMany(quizData);
    console.log(`Created ${createdQuizzes.length} quizzes`);

    console.log('Quiz seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quiz data:', error);
    process.exit(1);
  }
}

seedQuiz();

