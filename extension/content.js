// ユーザーIDを取得する関数
function getUserIdFromElement(element) {
  // デバッグ情報を出力
  console.log('要素の属性:', element.attributes);
  
  // 要素自体の属性をチェック
  const attributes = ['data-user-id', 'data-id', 'data-player-id', 'data-user'];
  for (const attr of attributes) {
    const userId = element.getAttribute(attr);
    if (userId) {
      console.log(`属性 ${attr} からIDを取得:`, userId);
      return userId;
    }
  }
  
  // 親要素もチェック
  let parent = element.parentElement;
  while (parent) {
    for (const attr of attributes) {
      const userId = parent.getAttribute(attr);
      if (userId) {
        console.log(`親要素の属性 ${attr} からIDを取得:`, userId);
        return userId;
      }
    }
    parent = parent.parentElement;
  }
  
  return null;
}

// プレイヤー名を取得する関数
function getPlayerNameFromElement(element) {
  // デバッグ情報を出力
  console.log('要素の内容:', element.innerHTML);
  
  // 要素自体のクラスをチェック
  const nameClasses = [
    'txt-name',
    'txt-player-name',
    'player-name',
    'name',
    'txt',
    'prt-user-name',
    'prt-user-info-name'
  ];
  
  // 要素自体をチェック
  for (const className of nameClasses) {
    const nameElement = element.classList.contains(className) ? element : element.querySelector(`.${className}`);
    if (nameElement && nameElement.textContent) {
      console.log(`クラス ${className} から名前を取得:`, nameElement.textContent.trim());
      return nameElement.textContent.trim();
    }
  }
  
  // 親要素をチェック
  let parent = element.parentElement;
  while (parent) {
    for (const className of nameClasses) {
      const nameElement = parent.classList.contains(className) ? parent : parent.querySelector(`.${className}`);
      if (nameElement && nameElement.textContent) {
        console.log(`親要素のクラス ${className} から名前を取得:`, nameElement.textContent.trim());
        return nameElement.textContent.trim();
      }
    }
    parent = parent.parentElement;
  }
  
  return null;
}

// プレイヤーリストの要素をクリックしたときの処理
function handlePlayerClick(event) {
  console.log('クリックイベント発生:', event.target);
  
  // クリックされた要素とその親要素を確認
  let currentElement = event.target;
  while (currentElement && currentElement !== document.body) {
    console.log('確認中の要素:', currentElement);
    const userId = getUserIdFromElement(currentElement);
    
    if (userId) {
      // ユーザーIDが見つかった場合、その要素からプレイヤー名を探す
      const playerName = getPlayerNameFromElement(currentElement);
      console.log('プレイヤー情報を送信:', { userId, playerName });
      
      // クリップボードにコピー
      navigator.clipboard.writeText(userId).then(() => {
        // コピー完了を通知
        const notification = document.createElement('div');
        notification.textContent = 'プレイヤーIDをコピーしました';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background-color: #4CAF50;
          color: white;
          padding: 10px 20px;
          border-radius: 4px;
          z-index: 9999;
          font-family: sans-serif;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(notification);

        // 2秒後に通知を消す
        setTimeout(() => {
          notification.remove();
          // 通知が消えた後にポップアップを開く
          try {
            chrome.runtime.sendMessage({
              type: 'PLAYER_SELECTED',
              userId: userId,
              playerName: playerName
            });
          } catch (error) {
            console.log('拡張機能のコンテキストが無効です。ページをリロードしてください。');
          }
        }, 2000);
      }).catch(err => {
        console.error('コピーに失敗しました:', err);
      });
      break;
    }
    
    currentElement = currentElement.parentElement;
  }
}

// ページ全体のクリックイベントを監視
document.addEventListener('click', (event) => {
  console.log('ページクリック:', event.target);
  handlePlayerClick(event);
});

// ブラックリストに登録されているプレイヤーをマークする関数
function markBlacklistedPlayers(blacklistedData) {
  console.log('ブラックリストユーザーをマーク:', blacklistedData);
  
  // すべてのプレイヤー要素を取得
  const playerElements = document.querySelectorAll('[data-user-id], [data-id], [data-player-id], [data-user]');
  
  playerElements.forEach(element => {
    const userId = getUserIdFromElement(element);
    if (userId && blacklistedData[userId]) {
      // すでにマークされている場合はスキップ
      if (element.dataset.blacklisted === 'true') return;
      
      // 要素にマークを追加
      element.dataset.blacklisted = 'true';
      
      // 視覚的なインジケーターを追加
      const indicator = document.createElement('div');
      indicator.className = 'blacklist-indicator';
      indicator.innerHTML = `
        <span class="blacklist-icon">⚠️</span>
        <div class="blacklist-tooltip">
          <strong>ブラックリスト登録済み</strong><br>
          理由: ${blacklistedData[userId].reason || 'なし'}
        </div>
      `;
      indicator.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        background-color: #ff4444;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 12px;
        z-index: 9999;
        cursor: pointer;
      `;
      
      // 要素の位置を相対的にする
      if (getComputedStyle(element).position === 'static') {
        element.style.position = 'relative';
      }
      
      element.appendChild(indicator);
      
      // ツールチップのスタイルを追加
      if (!document.getElementById('blacklist-styles')) {
        const style = document.createElement('style');
        style.id = 'blacklist-styles';
        style.textContent = `
          .blacklist-indicator {
            display: inline-block;
          }
          .blacklist-tooltip {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            margin-top: 4px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            z-index: 10000;
          }
          .blacklist-indicator:hover .blacklist-tooltip {
            display: block;
          }
          [data-blacklisted="true"] {
            border: 2px solid #ff4444 !important;
            box-shadow: 0 0 5px rgba(255, 68, 68, 0.5) !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  });
}

// ページ上のプレイヤーIDを収集してチェックする関数
async function checkPlayersOnPage() {
  const playerElements = document.querySelectorAll('[data-user-id], [data-id], [data-player-id], [data-user]');
  const playerIds = new Set();
  
  playerElements.forEach(element => {
    const userId = getUserIdFromElement(element);
    if (userId) {
      playerIds.add(userId);
    }
  });
  
  if (playerIds.size > 0) {
    console.log('ページ上のプレイヤーIDをチェック:', Array.from(playerIds));
    
    try {
      // 拡張機能のコンテキストが有効かチェック
      if (!chrome.runtime?.id) {
        console.log('拡張機能のコンテキストが無効です。');
        return;
      }
      
      const response = await chrome.runtime.sendMessage({
        type: 'CHECK_BLACKLIST',
        playerIds: Array.from(playerIds)
      });
      
      if (response && response.blacklisted) {
        markBlacklistedPlayers(response.blacklisted);
      }
    } catch (error) {
      if (error.message?.includes('Extension context invalidated')) {
        console.log('拡張機能が更新されました。ページをリロードしてください。');
      } else {
        console.error('ブラックリストチェックエラー:', error);
      }
    }
  }
}

// MutationObserverでDOMの変更を監視
const observer = new MutationObserver((mutations) => {
  // 新しい要素が追加されたかチェック
  const hasNewElements = mutations.some(mutation => 
    mutation.addedNodes.length > 0
  );
  
  if (hasNewElements) {
    // 少し遅延させてからチェック（レンダリング完了を待つ）
    setTimeout(checkPlayersOnPage, 500);
  }
});

// 対象ページかどうかをチェックする関数
function isTargetPage() {
  // URLのハッシュ部分を取得
  const hash = window.location.hash;
  // #lobby/room/member/数字 のパターンにマッチするかチェック
  const pattern = /^#lobby\/room\/member\/\d+$/;
  return pattern.test(hash);
}

// URLの変更を監視する関数
function watchUrlChanges() {
  let lastUrl = window.location.href;
  
  const urlObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      console.log('URL変更を検知:', currentUrl);
      
      if (isTargetPage()) {
        console.log('ロビーメンバーページを検知、ブラックリストチェックを開始');
        // 少し遅延させてからチェック（ページ遷移後のレンダリング待ち）
        setTimeout(checkPlayersOnPage, 1000);
      }
    }
  });
  
  // body要素の変更を監視（グラブルはSPAなのでURLが変わってもDOMContentLoadedは発火しない）
  urlObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ページ読み込み完了時の処理
document.addEventListener('DOMContentLoaded', () => {
  console.log('ページ読み込み完了');
  
  // URL変更の監視を開始
  watchUrlChanges();
  
  // 対象ページの場合のみ処理を実行
  if (isTargetPage()) {
    console.log('ロビーメンバーページです、ブラックリストチェックを開始');
    
    // 初回チェック
    checkPlayersOnPage();
    
    // DOM変更の監視を開始
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // 既存のプレイヤーリストからユーザーIDを取得（これは全ページで動作）
  const playerElements = document.querySelectorAll('[data-user-id], [data-id], [data-player-id], [data-user]');
  console.log('見つかったプレイヤー要素:', playerElements);
  
  playerElements.forEach((element) => {
    const userId = getUserIdFromElement(element);
    if (userId) {
      console.log('既存のプレイヤーIDを送信:', userId);
      try {
        chrome.runtime.sendMessage({
          type: 'USER_ID_FOUND',
          userId: userId
        });
      } catch (error) {
        console.log('拡張機能のコンテキストが無効です。');
      }
    }
  });
});

// ページが完全に読み込まれた後にも実行
window.addEventListener('load', () => {
  if (isTargetPage()) {
    setTimeout(checkPlayersOnPage, 1000);
  }
});

// hashchangeイベントも監視（念のため）
window.addEventListener('hashchange', () => {
  console.log('ハッシュ変更を検知:', window.location.hash);
  if (isTargetPage()) {
    console.log('ロビーメンバーページに遷移しました');
    setTimeout(checkPlayersOnPage, 1000);
  }
}); 