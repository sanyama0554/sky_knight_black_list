// Supabaseの設定
const supabaseUrl = "https://niemcgjjpcydjvmibmqx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZW1jZ2pqcGN5ZGp2bWlibXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjExMDUsImV4cCI6MjA2MTkzNzEwNX0.tZSS1uGb-DZqx3xWQaOoUrnKmLsVGthVXBMAs7LStQc";

// ブラックリストのキャッシュ
let blacklistCache = new Map();
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分間のキャッシュ

// ブラックリストを取得する関数
async function fetchBlacklist() {
  const now = Date.now();
  
  // キャッシュが有効な場合はキャッシュを返す
  if (blacklistCache.size > 0 && now - lastFetchTime < CACHE_DURATION) {
    return blacklistCache;
  }

  try {
    // Supabaseクライアントを動的にインポート
    const { createClient } = await import('./supabase.js');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('ユーザーが未ログインのため、ブラックリストを取得できません');
      return new Map();
    }

    // ブラックリストを取得
    const { data, error } = await supabase
      .from('blacklist')
      .select('player_id, player_name, reason')
      .eq('user_id', user.id);

    if (error) {
      console.error('ブラックリスト取得エラー:', error);
      return blacklistCache; // エラー時は既存のキャッシュを返す
    }

    // キャッシュを更新
    blacklistCache.clear();
    data.forEach(entry => {
      blacklistCache.set(entry.player_id, {
        playerName: entry.player_name,
        reason: entry.reason
      });
    });
    lastFetchTime = now;

    console.log('ブラックリストを更新しました:', blacklistCache.size, '件');
    return blacklistCache;
  } catch (error) {
    console.error('ブラックリスト取得中にエラーが発生しました:', error);
    return blacklistCache;
  }
}

// 選択されたプレイヤー情報を保存
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('バックグラウンドでメッセージを受信:', message);
  
  if (message.type === 'PLAYER_SELECTED') {
    console.log('プレイヤー情報を保存:', {
      userId: message.userId,
      playerName: message.playerName
    });
    
    // 選択されたプレイヤー情報を保存
    chrome.storage.session.set({
      selectedPlayer: {
        userId: message.userId,
        playerName: message.playerName
      }
    }, () => {
      // 保存完了を確認
      chrome.storage.session.get(['selectedPlayer'], (result) => {
        console.log('保存された情報:', result);
      });
    });
  } else if (message.type === 'CHECK_BLACKLIST') {
    // ブラックリストをチェック
    console.log('ブラックリストチェックリクエスト:', message.playerIds);
    
    fetchBlacklist().then(blacklist => {
      const results = {};
      message.playerIds.forEach(playerId => {
        if (blacklist.has(playerId)) {
          results[playerId] = blacklist.get(playerId);
        }
      });
      sendResponse({ blacklisted: results });
    });
    
    return true; // 非同期レスポンスのため
  } else if (message.type === 'REFRESH_BLACKLIST') {
    // キャッシュをクリアして再取得
    blacklistCache.clear();
    lastFetchTime = 0;
    
    fetchBlacklist().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    
    return true; // 非同期レスポンスのため
  }
}); 