export default function Footer() {
  return (
    <footer className="bg-slate-800/90 backdrop-blur-lg border-t border-slate-700 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-pink-500 mb-4">AniMap</h3>
            <p className="text-slate-400 text-sm">
              探索動畫中的真實場景，與同好分享聖地巡禮的樂趣
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">快速連結</h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <a href="/home" className="hover:text-pink-500 transition-colors">
                  首頁
                </a>
              </li>
              <li>
                <a href="/animes" className="hover:text-pink-500 transition-colors">
                  動畫列表
                </a>
              </li>
              <li>
                <a href="/map" className="hover:text-pink-500 transition-colors">
                  地圖探索
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">關於</h4>
            <p className="text-slate-400 text-sm">
              這是一個由動漫愛好者建立的聖地巡禮平台，歡迎大家一起分享和探索。
            </p>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400 text-sm">
          <p>&copy; 2024 AniMap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

