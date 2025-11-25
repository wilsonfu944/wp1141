import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-center">
          海龜湯 LINE Bot
          </h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          一個使用 AI 的海龜湯推理遊戲機器人
        </p>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">遊戲說明</h2>
            <p className="text-gray-700">
              海龜湯是一個推理遊戲，我會給你一個故事，你需要通過提問來找出真相。
              我只能回答「是」、「不是」或「無關」。試著找出故事背後的真相吧！
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">如何使用</h2>
            <ol className="list-decimal list-inside text-gray-700 space-y-1">
              <li>在 LINE 中搜尋並加入這個 Bot</li>
              <li>輸入「開始」來開始新遊戲</li>
              <li>通過提問來找出故事真相</li>
              <li>可以使用「提示」來獲得幫助</li>
            </ol>
          </div>
          <div className="pt-4 border-t border-gray-200">
            <Link
              href="/admin"
              className="block w-full text-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              前往管理後台
            </Link>
        </div>
        </div>
      </div>
    </div>
  );
}
