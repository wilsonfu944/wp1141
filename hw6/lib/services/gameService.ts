import Conversation, { IConversation } from '../db/models/Conversation';
import Message from '../db/models/Message';
import { generateResponse } from './llmClient';
import { log } from '../logger';

// 預設海龜湯謎題庫
const PUZZLES = [
  {
    id: 'puzzle-1',
    title: '電梯',
    story: '一個男人住在十樓，每天他會乘電梯下到大堂，然後離開大樓。晚上，他回來的時候，如果電梯裡有人或者那天下雨，他就會直接坐到十樓。否則，他就坐到七樓，然後走樓梯上去。為什麼？',
    answer: '這個男人是個侏儒，他只能按到七樓的按鈕。如果電梯裡有人，他可以請別人幫忙按十樓；如果下雨，他會帶傘，可以用傘按十樓的按鈕。',
  },
  {
    id: 'puzzle-2',
    title: '盲人',
    story: '一個盲人走進一家餐廳，點了一份牛排。吃完後，他站起來，掏出手槍，開了一槍，然後離開了。為什麼？',
    answer: '這個盲人走進餐廳時，他的導盲犬被服務生踢了一腳。吃完飯後，他開槍打死了服務生，因為他以為服務生是壞人。',
  },
  {
    id: 'puzzle-3',
    title: '房間',
    story: '一個男人走進一個房間，房間裡有一張床、一張桌子、一把椅子。他躺在床上，然後死了。為什麼？',
    answer: '這個房間是一個電梯，當他走進去時，電梯開始上升。他躺在床上（實際上是電梯的地板），然後電梯墜落，他死了。',
  },
];

const SYSTEM_PROMPT = `你是一個海龜湯遊戲的莊家。海龜湯是一個推理遊戲，玩家需要通過提問來找出故事背後的真相。

規則：
1. 你只能回答「是」、「不是」或「無關」
2. 如果玩家問的問題與謎題無關，回答「無關」
3. 如果玩家接近答案，可以給予適當的提示
4. 保持神秘和有趣的語氣
5. 當玩家猜出答案時，給予肯定並解釋完整故事

當前謎題：{PUZZLE_STORY}

請根據玩家的問題，用簡短的方式回答（「是」、「不是」或「無關」），必要時可以給予提示。`;

export async function handleGameMessage(
  userId: string,
  userName: string | undefined,
  messageText: string,
  conversation: IConversation | null
): Promise<{ reply: string; quickReplies?: Array<{ label: string; text: string }> }> {
  // 處理特殊指令
  const lowerText = messageText.toLowerCase().trim();

  // 開始新遊戲
  if (lowerText === '開始' || lowerText === '開始遊戲' || lowerText === '新遊戲' || lowerText.includes('開始')) {
    return await startNewGame(userId, userName, conversation);
  }

  // 重新開始
  if (lowerText === '重新開始' || lowerText === '重來' || lowerText.includes('重新')) {
    return await startNewGame(userId, userName, conversation);
  }

  // 提示
  if (lowerText === '提示' || lowerText === '我要提示' || lowerText.includes('提示')) {
    return await giveHint(userId, conversation);
  }

  // 查看當前謎題
  if (lowerText === '當前謎題' || lowerText === '謎題' || lowerText.includes('謎題')) {
    return await showCurrentPuzzle(userId, conversation);
  }

  // 如果沒有進行中的遊戲，引導開始
  if (!conversation || !conversation.gameState?.currentPuzzleId) {
    return {
      reply: '歡迎來到海龜湯遊戲！\n\n我是莊家，會給你一個故事，你需要通過提問來找出真相。\n\n我只能回答「是」、「不是」或「無關」。\n\n輸入「開始」來開始遊戲吧！',
      quickReplies: [
        { label: '開始遊戲', text: '開始' },
      ],
    };
  }

  // 處理遊戲中的提問
  return await handleGameQuestion(userId, messageText, conversation);
}

async function startNewGame(
  userId: string,
  userName: string | undefined,
  conversation: IConversation | null
): Promise<{ reply: string; quickReplies?: Array<{ label: string; text: string }> }> {
  // 隨機選擇一個謎題
  const puzzle = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];

  // 更新或創建對話
  let conv: IConversation;
  if (!conversation) {
    conv = new Conversation({
      userId,
      userName,
      platform: 'line',
      gameState: {
        currentPuzzleId: puzzle.id,
        puzzleTitle: puzzle.title,
        isSolved: false,
        hintsUsed: 0,
        startTime: new Date(),
      },
    });
  } else {
    conversation.gameState = {
      currentPuzzleId: puzzle.id,
      puzzleTitle: puzzle.title,
      isSolved: false,
      hintsUsed: 0,
      startTime: new Date(),
    };
    conversation.lastMessageAt = new Date();
    conv = conversation;
  }

  await conv.save();

  // 保存系統訊息
  await Message.create({
    conversationId: conv._id,
    userId,
    role: 'system',
    content: `開始新遊戲：${puzzle.title}`,
    metadata: { puzzleId: puzzle.id },
  });

  const reply = `好的！讓我們開始新的海龜湯遊戲。\n\n📖 謎題：${puzzle.title}\n\n${puzzle.story}\n\n現在你可以開始提問了！我只能回答「是」、「不是」或「無關」。`;

  return {
    reply,
    quickReplies: [
      { label: '我要提示', text: '提示' },
      { label: '重新開始', text: '重新開始' },
    ],
  };
}

async function giveHint(
  userId: string,
  conversation: IConversation | null
): Promise<{ reply: string; quickReplies?: Array<{ label: string; text: string }> }> {
  if (!conversation || !conversation.gameState?.currentPuzzleId) {
    return {
      reply: '你還沒有開始遊戲呢！輸入「開始」來開始遊戲吧。',
      quickReplies: [{ label: '開始遊戲', text: '開始' }],
    };
  }

  const puzzle = PUZZLES.find((p) => p.id === conversation.gameState?.currentPuzzleId);
  if (!puzzle) {
    return {
      reply: '找不到當前謎題，讓我們重新開始吧！',
      quickReplies: [{ label: '重新開始', text: '重新開始' }],
    };
  }

  const hintsUsed = conversation.gameState?.hintsUsed || 0;
  const hints = [
    '試著思考故事中的細節，哪些地方看起來不合理？',
    '注意故事中的人物行為，他們為什麼會這樣做？',
    '想想故事中沒有直接說明的部分，可能隱藏了什麼？',
    '答案往往在於理解角色的動機和背景。',
  ];

  const hint = hints[Math.min(hintsUsed, hints.length - 1)];

  if (!conversation.gameState) {
    conversation.gameState = {};
  }
  conversation.gameState.hintsUsed = hintsUsed + 1;
  conversation.lastMessageAt = new Date();
  await conversation.save();

  return {
    reply: `💡 提示：${hint}`,
    quickReplies: [
      { label: '繼續提問', text: '繼續' },
      { label: '重新開始', text: '重新開始' },
    ],
  };
}

async function showCurrentPuzzle(
  userId: string,
  conversation: IConversation | null
): Promise<{ reply: string; quickReplies?: Array<{ label: string; text: string }> }> {
  if (!conversation || !conversation.gameState?.currentPuzzleId) {
    return {
      reply: '你還沒有開始遊戲呢！輸入「開始」來開始遊戲吧。',
      quickReplies: [{ label: '開始遊戲', text: '開始' }],
    };
  }

  const puzzle = PUZZLES.find((p) => p.id === conversation.gameState?.currentPuzzleId);
  if (!puzzle) {
    return {
      reply: '找不到當前謎題，讓我們重新開始吧！',
      quickReplies: [{ label: '重新開始', text: '重新開始' }],
    };
  }

  return {
    reply: `📖 當前謎題：${puzzle.title}\n\n${puzzle.story}`,
    quickReplies: [
      { label: '我要提示', text: '提示' },
      { label: '繼續提問', text: '繼續' },
    ],
  };
}

async function handleGameQuestion(
  userId: string,
  messageText: string,
  conversation: IConversation
): Promise<{ reply: string; quickReplies?: Array<{ label: string; text: string }> }> {
  const puzzle = PUZZLES.find((p) => p.id === conversation.gameState?.currentPuzzleId);
  if (!puzzle) {
    return {
      reply: '找不到當前謎題，讓我們重新開始吧！',
      quickReplies: [{ label: '重新開始', text: '重新開始' }],
    };
  }

  // 檢查是否已經解決
  if (conversation.gameState?.isSolved) {
    return {
      reply: '這個謎題已經解決了！輸入「開始」來開始新的遊戲吧。',
      quickReplies: [{ label: '開始新遊戲', text: '開始' }],
    };
  }

  // 獲取對話歷史
  const messages = await Message.find({
    conversationId: conversation._id,
  })
    .sort({ timestamp: 1 })
    .limit(10)
    .select('role content')
    .lean();

  // 構建系統提示
  const systemPrompt = SYSTEM_PROMPT.replace('{PUZZLE_STORY}', puzzle.story);

  // 添加當前問題
  const conversationHistory = messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));

  conversationHistory.push({
    role: 'user',
    content: messageText,
  });

  try {
    // 調用 LLM
    const llmResponse = await generateResponse(conversationHistory, systemPrompt);

    // 檢查是否解決（簡單檢查）
    const isSolved = checkIfSolved(messageText, llmResponse, puzzle.answer);

    if (isSolved) {
      if (!conversation.gameState) {
        conversation.gameState = {};
      }
      conversation.gameState.isSolved = true;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      const finalReply = `${llmResponse}\n\n🎉 恭喜你！你猜對了！\n\n📚 完整故事：${puzzle.answer}\n\n輸入「開始」來開始新的遊戲吧！`;

      // 保存訊息
      await Message.create({
        conversationId: conversation._id,
        userId,
        role: 'user',
        content: messageText,
      });

      await Message.create({
        conversationId: conversation._id,
        userId,
        role: 'assistant',
        content: finalReply,
        metadata: { isHint: false },
      });

      return {
        reply: finalReply,
        quickReplies: [{ label: '開始新遊戲', text: '開始' }],
      };
    }

    // 保存訊息
    await Message.create({
      conversationId: conversation._id,
      userId,
      role: 'user',
      content: messageText,
    });

    await Message.create({
      conversationId: conversation._id,
      userId,
      role: 'assistant',
      content: llmResponse,
      metadata: { isHint: false },
    });

    conversation.messageCount = (conversation.messageCount || 0) + 2;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return {
      reply: llmResponse,
      quickReplies: [
        { label: '我要提示', text: '提示' },
        { label: '重新開始', text: '重新開始' },
      ],
    };
  } catch (error) {
    log.error('Error handling game question', { error, userId });
    return {
      reply: '抱歉，我暫時無法處理你的問題。請稍後再試，或輸入「重新開始」來開始新遊戲。',
      quickReplies: [
        { label: '重新開始', text: '重新開始' },
      ],
    };
  }
}

function checkIfSolved(userMessage: string, llmResponse: string, answer: string): boolean {
  // 簡單的檢查邏輯：如果 LLM 回應中包含「對」、「正確」、「答對了」等詞，認為已解決
  const solvedKeywords = ['對', '正確', '答對了', '恭喜', '猜對了', '解決了'];
  return solvedKeywords.some((keyword) => llmResponse.includes(keyword));
}

