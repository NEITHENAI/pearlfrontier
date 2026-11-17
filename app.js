// ==========================================================================
// PEARL FRONTIER (PF) - CORE ENGINE & ADMIN MANAGEMENT SUITE
// 100% Offline Compatible + Firebase Cloud Sync Enabled
// ==========================================================================

// --------------------------------------------------------------------------
// 1. FIREBASE INITIALIZATION (Client Config)
// --------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAy8qy-90nX5LPlnRoV580NycDDJt_i4X0",
  authDomain: "studio-7628266772-d55b9.firebaseapp.com",
  projectId: "studio-7628266772-d55b9",
  storageBucket: "studio-7628266772-d55b9.firebasestorage.app",
  messagingSenderId: "246934928782",
  appId: "1:246934928782:web:90c6b5338489678bbab8df"
};

let firebaseApp = null;
let firebaseStorage = null;

try {
  if (typeof firebase !== 'undefined') {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseStorage = firebase.storage();
    console.log("[Firebase] Initialized successfully with cloud storage.");
  }
} catch (e) {
  console.log("[Firebase] Running in local offline storage mode.");
}

// --------------------------------------------------------------------------
// 2. ADMIN AUTHENTICATION (Kyeyuneneithen1$)
// --------------------------------------------------------------------------
const ADMIN_PASSWORD = "Kyeyuneneithen1$";
let isAdmin = false;
let currentTargetPostId = null;

// --------------------------------------------------------------------------
// 3. REEL VIDEO SLOTS (Supports 2 Real Videos)
// --------------------------------------------------------------------------
let currentReelIndex = 1;
const REELS_DATA = {
  1: {
    videoUrl: "",
    author: "@plu_movement",
    title: "Youth leadership rally in Mbarara: standing united for patriotism and regional prosperity! 🇺🇬✨",
    likes: "84.5K"
  },
  2: {
    videoUrl: "",
    author: "@frontier_creator",
    title: "Kampala night skyline & culture: our sovereign creative economy rising! 🌆🔥",
    likes: "42.1K"
  }
};

// --------------------------------------------------------------------------
// 4. OFFICIAL LOGO: PEARL FRONTIER (Speed & Italic)
// --------------------------------------------------------------------------
const OFFICIAL_LOGO_SVG = `
  <g>
    <!-- Stately Architectural Serif "PEARL" -->
    <text x="2" y="24" font-family="'Times New Roman', Georgia, serif" font-size="20" font-weight="800" letter-spacing="1.2" fill="currentColor">
      PEARL
    </text>

    <!-- Sovereign Gold Accent Dot -->
    <circle cx="82" cy="18" r="2.2" fill="#F59E0B" />

    <!-- Cutting Speed-Italic "FRONTIER" -->
    <text x="88" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" font-style="italic" letter-spacing="0.8" fill="currentColor" transform="skewX(-15)">
      FRONTIER
    </text>

    <!-- Aerodynamic Forward-Thrust Line -->
    <path d="M88 28 L215 28" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round" />
    <polygon points="218,28 214,26 214,30" fill="#F59E0B" />
  </g>
`;

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupFilterPills();
  initOfficialLogo();
  checkSavedAdminState();
  initReelsEngine();
  loadSavedEdits();
});

function initOfficialLogo() {
  const svgElem = document.getElementById('pfLogoSvg');
  if (svgElem) {
    svgElem.setAttribute('viewBox', '0 0 226 36');
    svgElem.style.width = '165px';
    svgElem.innerHTML = OFFICIAL_LOGO_SVG;
  }
}

// --------------------------------------------------------------------------
// ADMIN LOGIN & SECRET DOOR
// --------------------------------------------------------------------------
function handleLogoClick() {
  if (isAdmin) {
    if (confirm("Admin Mode is active. Do you want to disable Admin Mode?")) {
      logoutAdmin();
    }
  } else {
    openAdminAuthModal();
  }
}

function openAdminAuthModal() {
  document.getElementById('adminAuthModal').classList.add('open');
  const input = document.getElementById('adminPasswordInput');
  input.value = '';
  document.getElementById('adminErrorMsg').style.display = 'none';
  setTimeout(() => input.focus(), 150);
}

function closeAdminAuthModal() {
  document.getElementById('adminAuthModal').classList.remove('open');
}

function handleAdminKeypress(e) {
  if (e.key === 'Enter') {
    verifyAdminPassword();
  }
}

function verifyAdminPassword() {
  const input = document.getElementById('adminPasswordInput');
  const errorMsg = document.getElementById('adminErrorMsg');

  if (input.value === ADMIN_PASSWORD) {
    activateAdminMode();
    closeAdminAuthModal();
    alert("🔒 Sovereign Administrator Access Granted!\n\nYou can now change avatars, attach post images/videos, and upload real video reels.");
  } else {
    errorMsg.style.display = 'block';
    input.select();
  }
}

function activateAdminMode() {
  isAdmin = true;
  document.body.classList.add('admin-mode');
  sessionStorage.setItem('pf_admin_active', 'true');
  const adminPill = document.getElementById('adminPill');
  if (adminPill) adminPill.classList.add('active');
  const locPill = document.getElementById('locationPill');
  if (locPill) locPill.style.display = 'none';
}

function logoutAdmin() {
  isAdmin = false;
  document.body.classList.remove('admin-mode');
  sessionStorage.removeItem('pf_admin_active');
  const adminPill = document.getElementById('adminPill');
  if (adminPill) adminPill.classList.remove('active');
  const locPill = document.getElementById('locationPill');
  if (locPill) locPill.style.display = 'inline-flex';
}

function checkSavedAdminState() {
  if (sessionStorage.getItem('pf_admin_active') === 'true') {
    activateAdminMode();
  }
}

function toggleAdminPanel() {
  handleLogoClick();
}

// --------------------------------------------------------------------------
// ADMIN POST EDITING (Avatar, Media, Text)
// --------------------------------------------------------------------------
function triggerAvatarUpload(postId) {
  currentTargetPostId = postId;
  document.getElementById('adminAvatarPicker').click();
}

function handleAdminAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentTargetPostId) return;

  const localUrl = URL.createObjectURL(file);
  const avatarElem = document.getElementById(`avatar-${currentTargetPostId.replace('post-', '')}`);

  if (avatarElem) {
    avatarElem.innerHTML = `<img src="${localUrl}" alt="Avatar">`;
    saveEditToStorage(`avatar_${currentTargetPostId}`, localUrl);
  }

  // Upload to Firebase if online
  if (firebaseStorage) {
    const storageRef = firebaseStorage.ref(`avatars/${currentTargetPostId}_${Date.now()}`);
    storageRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(downloadURL => {
        saveEditToStorage(`avatar_${currentTargetPostId}`, downloadURL);
      });
    }).catch(err => console.log("[Storage fallback] Using local image:", err));
  }

  e.target.value = '';
}

function triggerMediaUpload(postId) {
  currentTargetPostId = postId;
  document.getElementById('adminMediaPicker').click();
}

function handleAdminMediaUpload(e) {
  const file = e.target.files[0];
  if (!file || !currentTargetPostId) return;

  const localUrl = URL.createObjectURL(file);
  const mediaContainer = document.getElementById(`media-${currentTargetPostId.replace('post-', '')}`);

  if (mediaContainer) {
    mediaContainer.style.display = 'block';
    if (file.type.startsWith('video/')) {
      mediaContainer.innerHTML = `
        <video src="${localUrl}" controls style="width:100%; max-height:420px; object-fit:cover; display:block;" playsinline autoplay muted loop></video>
      `;
    } else {
      mediaContainer.innerHTML = `
        <img src="${localUrl}" alt="Media" style="width:100%; max-height:420px; object-fit:cover; display:block;">
      `;
    }
    saveEditToStorage(`media_${currentTargetPostId}`, { url: localUrl, isVideo: file.type.startsWith('video/') });
  }

  if (firebaseStorage) {
    const storageRef = firebaseStorage.ref(`posts/${currentTargetPostId}_${Date.now()}`);
    storageRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(downloadURL => {
        saveEditToStorage(`media_${currentTargetPostId}`, { url: downloadURL, isVideo: file.type.startsWith('video/') });
      });
    }).catch(err => console.log("[Storage fallback] Using local media"));
  }

  e.target.value = '';
}

function triggerTextEdit(postId) {
  currentTargetPostId = postId;
  const postKey = postId.replace('post-', '');
  
  const nameElem = document.getElementById(`name-${postKey}`);
  const handleElem = document.getElementById(`handle-${postKey}`);
  const textElem = document.getElementById(`text-${postKey}`);

  document.getElementById('editAuthorName').value = nameElem ? nameElem.textContent.trim() : '';
  document.getElementById('editAuthorHandle').value = handleElem ? handleElem.textContent.trim() : '';
  document.getElementById('editPostText').value = textElem ? textElem.textContent.trim() : '';

  document.getElementById('adminEditModal').classList.add('open');
}

function closeAdminEditModal() {
  document.getElementById('adminEditModal').classList.remove('open');
}

function saveAdminTextEdit() {
  if (!currentTargetPostId) return;
  const postKey = currentTargetPostId.replace('post-', '');

  const newName = document.getElementById('editAuthorName').value.trim();
  const newHandle = document.getElementById('editAuthorHandle').value.trim();
  const newText = document.getElementById('editPostText').value.trim();

  const nameElem = document.getElementById(`name-${postKey}`);
  const handleElem = document.getElementById(`handle-${postKey}`);
  const textElem = document.getElementById(`text-${postKey}`);

  if (nameElem && newName) nameElem.textContent = newName;
  if (handleElem && newHandle) handleElem.textContent = newHandle;
  if (textElem && newText) textElem.textContent = newText;

  saveEditToStorage(`text_${currentTargetPostId}`, {
    name: newName,
    handle: newHandle,
    text: newText
  });

  closeAdminEditModal();
}

function triggerProfileAvatarUpload() {
  currentTargetPostId = 'profile-user';
  document.getElementById('adminAvatarPicker').click();
}

// --------------------------------------------------------------------------
// REELS ENGINE: 2 REAL VIDEO SLOTS & ADMIN UPLOAD
// --------------------------------------------------------------------------
function initReelsEngine() {
  loadReelVideo(currentReelIndex);
}

function switchReelVideo(index) {
  currentReelIndex = index;
  document.getElementById('btnReel1').classList.toggle('active', index === 1);
  document.getElementById('btnReel2').classList.toggle('active', index === 2);
  document.getElementById('currentReelLabel').textContent = `Reel ${index}`;

  loadReelVideo(index);
}

function loadReelVideo(index) {
  const videoElem = document.getElementById('mainReelVideo');
  const sourceElem = document.getElementById('mainReelSource');
  const authorElem = document.getElementById('reelAuthor');
  const titleElem = document.getElementById('reelTitle');
  const likesElem = document.getElementById('clipLikesCount');

  const reel = REELS_DATA[index];
  authorElem.textContent = reel.author;
  titleElem.textContent = reel.title;
  likesElem.textContent = reel.likes;

  // Check saved video from storage
  const savedVideo = localStorage.getItem(`pf_reel_video_${index}`);
  const targetUrl = savedVideo || reel.videoUrl;

  if (targetUrl) {
    sourceElem.src = targetUrl;
    videoElem.load();
    videoElem.play().catch(() => {});
  } else {
    // If no video uploaded yet, show fallback poster frame
    videoElem.poster = "";
  }
}

function triggerReelUpload() {
  document.getElementById('adminReelPicker').click();
}

function handleAdminReelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const localUrl = URL.createObjectURL(file);
  REELS_DATA[currentReelIndex].videoUrl = localUrl;

  const videoElem = document.getElementById('mainReelVideo');
  const sourceElem = document.getElementById('mainReelSource');
  sourceElem.src = localUrl;
  videoElem.load();
  videoElem.play().catch(() => {});

  localStorage.setItem(`pf_reel_video_${currentReelIndex}`, localUrl);
  alert(`✅ Video successfully uploaded for Reel ${currentReelIndex}! Playing now.`);

  // Firebase Cloud upload if online
  if (firebaseStorage) {
    const storageRef = firebaseStorage.ref(`reels/reel_${currentReelIndex}_${Date.now()}.mp4`);
    storageRef.put(file).then(snapshot => {
      snapshot.ref.getDownloadURL().then(downloadURL => {
        localStorage.setItem(`pf_reel_video_${currentReelIndex}`, downloadURL);
      });
    }).catch(err => console.log("[Storage fallback] Using local blob"));
  }

  e.target.value = '';
}

function toggleReelSound() {
  const videoElem = document.getElementById('mainReelVideo');
  const iconElem = document.getElementById('reelSoundIcon');
  const labelElem = document.getElementById('soundLabel');

  videoElem.muted = !videoElem.muted;

  if (videoElem.muted) {
    labelElem.textContent = "Unmute";
    iconElem.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>`;
  } else {
    labelElem.textContent = "Mute";
    iconElem.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
  }
}

// --------------------------------------------------------------------------
// LOCAL STORAGE PERSISTENCE HELPERS
// --------------------------------------------------------------------------
function saveEditToStorage(key, value) {
  try {
    localStorage.setItem(`pf_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage full or blocked");
  }
}

function loadSavedEdits() {
  const postKeys = ['mk', 'police', 'mtn', 'kenzo', 'citizen'];
  postKeys.forEach(key => {
    // Avatars
    const savedAvatar = localStorage.getItem(`pf_avatar_post-${key}`);
    if (savedAvatar) {
      try {
        const url = JSON.parse(savedAvatar);
        const avatarElem = document.getElementById(`avatar-${key}`);
        if (avatarElem) avatarElem.innerHTML = `<img src="${url}" alt="Avatar">`;
      } catch (e) {}
    }

    // Media
    const savedMedia = localStorage.getItem(`pf_media_post-${key}`);
    if (savedMedia) {
      try {
        const data = JSON.parse(savedMedia);
        const mediaElem = document.getElementById(`media-${key}`);
        if (mediaElem && data.url) {
          mediaElem.style.display = 'block';
          if (data.isVideo) {
            mediaElem.innerHTML = `<video src="${data.url}" controls style="width:100%; max-height:420px; object-fit:cover;" playsinline autoplay muted loop></video>`;
          } else {
            mediaElem.innerHTML = `<img src="${data.url}" style="width:100%; max-height:420px; object-fit:cover;">`;
          }
        }
      } catch (e) {}
    }

    // Text
    const savedText = localStorage.getItem(`pf_text_post-${key}`);
    if (savedText) {
      try {
        const data = JSON.parse(savedText);
        if (data.name) document.getElementById(`name-${key}`).textContent = data.name;
        if (data.handle) document.getElementById(`handle-${key}`).textContent = data.handle;
        if (data.text) document.getElementById(`text-${key}`).textContent = data.text;
      } catch (e) {}
    }
  });

  // Profile avatar
  const profileAvatar = localStorage.getItem('pf_avatar_profile-user');
  if (profileAvatar) {
    try {
      const url = JSON.parse(profileAvatar);
      const userElem = document.getElementById('profileUserAvatar');
      if (userElem) userElem.innerHTML = `<img src="${url}" alt="Profile Avatar">`;
    } catch (e) {}
  }
}

// --------------------------------------------------------------------------
// GENERAL APP ACTIONS (Tabs, Likes, Reposts, Modal, Chat)
// --------------------------------------------------------------------------
function switchTab(tabId) {
  const allViews = document.querySelectorAll('.tab-view');
  allViews.forEach(view => view.classList.remove('active'));

  const targetView = document.getElementById(`tab-${tabId}`);
  if (targetView) targetView.classList.add('active');

  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-tab') === tabId);
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupFilterPills() {
  const pills = document.querySelectorAll('.pill-filter');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const parent = pill.parentElement;
      parent.querySelectorAll('.pill-filter').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.getAttribute('data-filter');
      if (!filter) return;

      if (filter === 'clips') {
        switchTab('clips');
        return;
      }

      const cards = document.querySelectorAll('#postsList .post-card');
      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

function toggleLike(btn, baseCount) {
  const countSpan = btn.querySelector('.count');
  const isLiked = btn.classList.toggle('liked');
  const svg = btn.querySelector('svg');

  if (isLiked) {
    svg.setAttribute('fill', 'currentColor');
    countSpan.textContent = formatCount(baseCount + 1);
  } else {
    svg.setAttribute('fill', 'none');
    countSpan.textContent = formatCount(baseCount);
  }
}

function toggleRepost(btn, baseCount) {
  const countSpan = btn.querySelector('.count');
  const isReposted = btn.classList.toggle('reposted');
  countSpan.textContent = isReposted ? formatCount(baseCount + 1) : formatCount(baseCount);
}

function toggleClipLike(item) {
  const countElem = document.getElementById('clipLikesCount');
  const circle = item.querySelector('.clip-action-circle');
  const isLiked = circle.classList.toggle('liked');

  if (isLiked) {
    circle.style.background = '#E11D48';
    circle.querySelector('svg').setAttribute('fill', '#FFFFFF');
    countElem.textContent = '84.6K';
  } else {
    circle.style.background = 'rgba(255, 255, 255, 0.2)';
    circle.querySelector('svg').setAttribute('fill', 'none');
    countElem.textContent = '84.5K';
  }
}

function formatCount(num) {
  return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num.toString();
}

function openComposeModal() {
  document.getElementById('composeModal').classList.add('open');
  document.getElementById('composeTextInput').focus();
}

function closeComposeModal() {
  document.getElementById('composeModal').classList.remove('open');
}

function submitDispatch() {
  const textInput = document.getElementById('composeTextInput');
  const text = textInput.value.trim();
  if (!text) {
    alert('Please enter your dispatch text.');
    return;
  }

  const newPost = document.createElement('article');
  newPost.className = 'post-card';
  newPost.setAttribute('data-category', 'silver');

  newPost.innerHTML = `
    <div class="post-avatar-wrapper">
      <div class="avatar" style="background: #111827; color: #FFFFFF;">PF</div>
    </div>
    <div class="post-content">
      <div class="post-header">
        <div class="post-author-info">
          <span class="author-name">
            Frontier Pioneer
            <span class="verified-check-badge" title="Silver Pearl Check — Subscribed Citizen">
              <svg class="badge-svg" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.6 4.3L18.1 4.1L19.2 7.4L22.4 8.9L21.9 12.4L23.5 15.6L20.6 17.6L20.5 21.1L17 21.6L15.2 24.6L12 23.2L8.8 24.6L7 21.6L3.5 21.1L3.4 17.6L0.5 15.6L2.1 12.4L1.6 8.9L4.8 7.4L5.9 4.1L9.4 4.3L12 2Z" fill="#94A3B8"/><path d="M9.5 12.5L11.5 14.5L15.5 10" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/></svg>
            </span>
          </span>
          <span class="author-handle">@frontier_pioneer</span>
        </div>
        <span class="post-time">Just now</span>
      </div>
      <p class="post-text">${escapeHtml(text)}</p>
      <div class="post-actions">
        <button class="action-btn like-btn" onclick="toggleLike(this, 1)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg><span class="count">1</span></button>
        <button class="action-btn repost-btn" onclick="toggleRepost(this, 0)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"></path><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><path d="M7 23l-4-4 4-4"></path><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg><span class="count">0</span></button>
      </div>
    </div>
  `;

  const postsList = document.getElementById('postsList');
  postsList.insertBefore(newPost, postsList.firstChild);
  textInput.value = '';
  closeComposeModal();
  switchTab('wire');
}

function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('open');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('open');
}

function openChat(name, badgeType) {
  const drawer = document.getElementById('chatDrawer');
  let badgeSvg = '';
  if (badgeType === 'gold') badgeSvg = '<span class="verified-check-badge" style="width:16px; height:16px;"><svg class="badge-svg" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.6 4.3L18.1 4.1L19.2 7.4L22.4 8.9L21.9 12.4L23.5 15.6L20.6 17.6L20.5 21.1L17 21.6L15.2 24.6L12 23.2L8.8 24.6L7 21.6L3.5 21.1L3.4 17.6L0.5 15.6L2.1 12.4L1.6 8.9L4.8 7.4L5.9 4.1L9.4 4.3L12 2Z" fill="#EAB308"/><path d="M9.5 12.5L11.5 14.5L15.5 10" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/></svg></span>';
  else if (badgeType === 'blue') badgeSvg = '<span class="verified-check-badge" style="width:16px; height:16px;"><svg class="badge-svg" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.6 4.3L18.1 4.1L19.2 7.4L22.4 8.9L21.9 12.4L23.5 15.6L20.6 17.6L20.5 21.1L17 21.6L15.2 24.6L12 23.2L8.8 24.6L7 21.6L3.5 21.1L3.4 17.6L0.5 15.6L2.1 12.4L1.6 8.9L4.8 7.4L5.9 4.1L9.4 4.3L12 2Z" fill="#1D9BF0"/><path d="M9.5 12.5L11.5 14.5L15.5 10" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/></svg></span>';
  else badgeSvg = '<span class="verified-check-badge" style="width:16px; height:16px;"><svg class="badge-svg" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.6 4.3L18.1 4.1L19.2 7.4L22.4 8.9L21.9 12.4L23.5 15.6L20.6 17.6L20.5 21.1L17 21.6L15.2 24.6L12 23.2L8.8 24.6L7 21.6L3.5 21.1L3.4 17.6L0.5 15.6L2.1 12.4L1.6 8.9L4.8 7.4L5.9 4.1L9.4 4.3L12 2Z" fill="#94A3B8"/><path d="M9.5 12.5L11.5 14.5L15.5 10" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round"/></svg></span>';

  document.getElementById('chatActiveUser').innerHTML = `${name} ${badgeSvg}`;
  drawer.classList.add('open');
}

function closeChat() {
  document.getElementById('chatDrawer').classList.remove('open');
}

function handleChatKey(event) {
  if (event.key === 'Enter') sendChatMessage();
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;

  const messagesContainer = document.getElementById('chatMessages');
  const outBubble = document.createElement('div');
  outBubble.className = 'msg-bubble outgoing';
  outBubble.textContent = msg;
  messagesContainer.appendChild(outBubble);

  input.value = '';
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  setTimeout(() => {
    const inBubble = document.createElement('div');
    inBubble.className = 'msg-bubble incoming';
    inBubble.textContent = "Dispatch acknowledged under sovereign encryption protocol.";
    messagesContainer.appendChild(inBubble);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 900);
}

function initTheme() {
  const toggleBtn = document.getElementById('themeToggleBtn');
  if (!toggleBtn) return;

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('themeIcon');
  if (theme === 'dark') {
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`;
  } else {
    icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`;
  }
}

function escapeHtml(string) {
  const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;' };
  return String(string).replace(/[&<>"'\/]/g, s => entityMap[s]);
}

function sharePost(author) {
  if (navigator.share) {
    navigator.share({
      title: 'Pearl Frontier Dispatch',
      text: `Read this dispatch by ${author} on Pearl Frontier: Uganda's Sovereign Square.`,
      url: window.location.href
    }).catch(() => {});
  } else {
    alert(`Link copied to clipboard! Share on WhatsApp.`);
  }
}

function openCommentModal(author) {
  alert(`Open discussion thread for ${author}'s dispatch.`);
}

const threeDotsBtn = document.getElementById('threeDotsBtn');
if (threeDotsBtn) {
  threeDotsBtn.addEventListener('click', openSettingsModal);
}
