// ローカルのSupabaseスクリプトを使用
console.log('popup.js: スクリプト開始');

// Supabaseの設定
const supabaseUrl = "https://niemcgjjpcydjvmibmqx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZW1jZ2pqcGN5ZGp2bWlibXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjExMDUsImV4cCI6MjA2MTkzNzEwNX0.tZSS1uGb-DZqx3xWQaOoUrnKmLsVGthVXBMAs7LStQc";
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

console.log('popup.js: Supabaseクライアント初期化完了');

// UI要素
const userInfo = document.getElementById('user-info');
const loginForm = document.getElementById('login-form');
const userEmail = document.getElementById('user-email');
const mainContent = document.getElementById('main-content');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const logoutBtn = document.getElementById('logout-btn');
const addBtn = document.getElementById('addBtn');

console.log('UI要素の初期化:', {
  userInfo,
  loginForm,
  userEmail,
  mainContent,
  loginBtn,
  signupBtn,
  logoutBtn,
  addBtn
});

function showSpinner(isLogin, show) {
  const spinner = document.getElementById(isLogin ? 'spinner-login' : 'spinner-main');
  if (spinner) spinner.style.display = show ? 'block' : 'none';
}

function showNotification(message, type = 'success', isLogin = false) {
  console.log('通知を表示:', message, type, isLogin);
  let resultDiv;
  if (isLogin) {
    resultDiv = document.getElementById('login-result');
  } else {
    resultDiv = document.getElementById('result');
  }
  if (!resultDiv) {
    console.error('result要素が見つかりません');
    return;
  }
  showSpinner(isLogin, false); // 通知表示時はスピナーを消す
  if (message.includes('<')) {
    resultDiv.innerHTML = message;
  } else {
    resultDiv.textContent = message;
  }
  resultDiv.className = type;
  setTimeout(() => {
    resultDiv.innerHTML = '';
    resultDiv.className = '';
  }, 10000);
}

// ログイン状態を確認
async function checkAuth() {
  console.log('認証状態を確認中...');
  const { data: { user } } = await supabase.auth.getUser();
  console.log('認証状態:', user ? 'ログイン中' : '未ログイン');
  
  const userInfo = document.getElementById('user-info');
  const loginForm = document.getElementById('login-form');
  const userEmail = document.getElementById('user-email');
  const mainContent = document.getElementById('main-content');

  if (!userInfo || !loginForm || !userEmail || !mainContent) {
    console.error('必要なUI要素が見つかりません');
    return;
  }

  if (user) {
    // ログイン済み
    userEmail.textContent = user.email;
    userInfo.classList.add('active');
    loginForm.classList.remove('active');
    mainContent.style.display = 'block';
  } else {
    // 未ログイン
    userInfo.classList.remove('active');
    loginForm.classList.add('active');
    mainContent.style.display = 'none';
  }
}

// ログイン処理
async function handleLogin(email, password) {
  console.log('ログイン処理開始:', email);
  showSpinner(true, true);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  showSpinner(true, false);
  if (error) {
    console.log('ログインエラー:', error);
    showNotification(error.message, 'error', true);
  } else {
    console.log('ログイン成功:', data);
    showNotification('ログインしました', 'success', true);
    checkAuth();
  }
}

// 新規登録処理
async function handleSignup(email, password) {
  console.log('新規登録処理開始:', email);
  showSpinner(true, true);
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  showSpinner(true, false);
  console.log('新規登録結果:', { data, error });
  if (error) {
    console.log('新規登録エラー:', error);
    showNotification(error.message, 'error', true);
  } else if (data.user && !data.user.confirmed_at) {
    console.log('確認メール送信完了');
    showNotification(`
      <div style=\"text-align: left; padding: 4px;\">
        <p style=\"margin-bottom: 8px;\">確認メールを送信しました！</p>
        <p style=\"margin-bottom: 4px;\">次のステップ：</p>
        <ol style=\"margin: 0; padding-left: 20px;\">
          <li>メールボックスを確認してください</li>
          <li>確認メールのリンクをクリックしてください</li>
          <li>確認完了後、ログインしてください</li>
        </ol>
      </div>
    `, 'success', true);
  } else if (data.user) {
    console.log('新規登録完了');
    showNotification('新規登録が完了しました。ログインしてください。', 'success', true);
  } else {
    console.log('新規登録処理完了');
    showNotification('新規登録処理が完了しました。', 'success', true);
  }
}

// ログアウト処理
async function handleLogout() {
  console.log('ログアウト処理開始');
  showSpinner(true, true);
  const { error } = await supabase.auth.signOut();
  showSpinner(true, false);
  if (error) {
    console.log('ログアウトエラー:', error);
    showNotification(error.message, 'error', true);
  } else {
    console.log('ログアウト成功');
    showNotification('ログアウトしました', 'success', true);
    checkAuth();
  }
}

// 保存されたプレイヤー情報を読み込む
chrome.storage.session.get(['selectedPlayer'], (result) => {
  console.log('保存されたプレイヤー情報を確認:', result);
  if (result.selectedPlayer) {
    const playerIdInput = document.getElementById('player_id');
    const playerNameInput = document.getElementById('player_name');
    
    if (playerIdInput && playerNameInput) {
      playerIdInput.value = result.selectedPlayer.userId;
      playerNameInput.value = result.selectedPlayer.playerName;
      showNotification('プレイヤー情報を取得しました');
    } else {
      console.error('プレイヤー情報入力フィールドが見つかりません');
    }
    // 情報をクリア
    chrome.storage.session.remove(['selectedPlayer']);
  }
});

// content scriptからのメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('メッセージを受信:', message);
  if (message.type === 'USER_ID_FOUND') {
    const playerIdInput = document.getElementById('player_id');
    if (playerIdInput) {
      playerIdInput.value = message.userId;
      showNotification('プレイヤーIDを取得しました');
    }
  } else if (message.type === 'PLAYER_SELECTED') {
    const playerIdInput = document.getElementById('player_id');
    const playerNameInput = document.getElementById('player_name');
    if (playerIdInput && playerNameInput) {
      playerIdInput.value = message.userId;
      if (message.playerName) {
        playerNameInput.value = message.playerName;
        showNotification('プレイヤー情報を取得しました');
      }
    }
  }
});

// 初期化関数
function initialize() {
  console.log('初期化を開始します');
  
  // UI要素の取得
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const addBtn = document.getElementById('addBtn');

  console.log('UI要素の初期化:', {
    loginBtn: loginBtn ? '見つかりました' : '見つかりません',
    signupBtn: signupBtn ? '見つかりました' : '見つかりません',
    logoutBtn: logoutBtn ? '見つかりました' : '見つかりません',
    addBtn: addBtn ? '見つかりました' : '見つかりません'
  });

  // イベントリスナーの設定
  if (loginBtn) {
    console.log('ログインボタンにイベントリスナーを設定');
    loginBtn.addEventListener('click', () => {
      console.log('ログインボタンがクリックされました');
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      handleLogin(email, password);
    });
  }

  if (signupBtn) {
    console.log('新規登録ボタンにイベントリスナーを設定');
    signupBtn.addEventListener('click', () => {
      console.log('新規登録ボタンがクリックされました');
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      console.log('入力値:', { email, password });
      if (!email || !password) {
        showNotification('メールアドレスとパスワードを入力してください', 'error', true);
        return;
      }
      handleSignup(email, password);
    });
  }

  if (logoutBtn) {
    console.log('ログアウトボタンにイベントリスナーを設定');
    logoutBtn.addEventListener('click', () => {
      console.log('ログアウトボタンがクリックされました');
      handleLogout();
    });
  }

  if (addBtn) {
    console.log('追加ボタンにイベントリスナーを設定');
    addBtn.addEventListener('click', async () => {
      const player_id = document.getElementById('player_id').value;
      const player_name = document.getElementById('player_name').value;
      const reason = document.getElementById('reason').value;

      // 入力チェック（プレイヤーIDとプレイヤー名のみ必須）
      if (!player_id || !player_name) {
        showNotification("プレイヤーIDとプレイヤー名は必須です", "error", true);
        return;
      }

      // 現在のユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        showNotification("ログインが必要です", "error", true);
        return;
      }

      // ブラックリストに追加
      const { data, error } = await supabase
        .from('blacklist')
        .insert([{ 
          player_id, 
          player_name, 
          reason: reason || null,
          user_id: user.id
        }]);

      if (error) {
        console.error("ブラックリスト追加エラー:", error);
        showNotification("エラー: " + error.message, "error", true);
      } else {
        showNotification("ブラックリストに追加しました！");
        // 入力フィールドをクリア
        document.getElementById('player_id').value = "";
        document.getElementById('player_name').value = "";
        document.getElementById('reason').value = "";
        
        // ブラックリストキャッシュを更新
        chrome.runtime.sendMessage({ type: 'REFRESH_BLACKLIST' });
      }
    });
  }

  // ブラックリスト更新ボタン
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    console.log('更新ボタンにイベントリスナーを設定');
    refreshBtn.addEventListener('click', async () => {
      showSpinner(false, true);
      
      chrome.runtime.sendMessage({ type: 'REFRESH_BLACKLIST' }, (response) => {
        showSpinner(false, false);
        if (response && response.success) {
          showNotification('ブラックリストを更新しました', 'success');
        } else {
          showNotification('更新に失敗しました', 'error');
        }
      });
    });
  }

  // 認証状態の確認
  checkAuth();
}

// DOMContentLoadedイベントで初期化を実行
if (document.readyState === 'loading') {
  console.log('DOMContentLoadedイベントを待機中...');
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  console.log('DOMContentLoadedイベントは既に発生済み、即時初期化を実行');
  initialize();
}