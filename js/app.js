// 일본어 프리토킹 AI 튜터 - 앱 컨트롤러 v2
class App {
  constructor() {
    this.gemini = new GeminiAPI();
    this.isProcessing = false;
    this.recognition = null;
    this.isRecording = false;

    this.screens = {
      onboarding: document.getElementById('onboarding-screen'),
      chat: document.getElementById('chat-screen'),
      scenario: document.getElementById('scenario-screen'),
      settings: document.getElementById('settings-screen')
    };

    this.els = {
      startBtn: document.getElementById('start-btn'),
      onboardingLevelSelector: document.getElementById('onboarding-level-selector'),
      chatMessages: document.getElementById('chat-messages'),
      messageInput: document.getElementById('message-input'),
      sendBtn: document.getElementById('send-btn'),
      micBtn: document.getElementById('mic-btn'),
      typingIndicator: document.getElementById('typing-indicator'),
      welcomeMessage: document.getElementById('welcome-message'),
      headerMode: document.getElementById('header-mode'),
      levelBadge: document.getElementById('level-badge'),
      newChatBtn: document.getElementById('new-chat-btn'),
      scenarioBtn: document.getElementById('scenario-btn'),
      settingsBtn: document.getElementById('settings-btn'),
      scenarioBackBtn: document.getElementById('scenario-back-btn'),
      categoryTabs: document.getElementById('category-tabs'),
      scenarioGrid: document.getElementById('scenario-grid'),
      settingsBackBtn: document.getElementById('settings-back-btn'),
      settingsApiKey: document.getElementById('settings-api-key'),
      toggleSettingsKey: document.getElementById('toggle-settings-key'),
      settingsLevelSelector: document.getElementById('settings-level-selector'),
      themeToggle: document.getElementById('theme-toggle'),
      clearHistoryBtn: document.getElementById('clear-history-btn'),
      toast: document.getElementById('toast'),
      toastMessage: document.getElementById('toast-message')
    };

    this.init();
  }

  init() {
    this.loadSettings();
    this.bindEvents();
    this.renderScenarios();
    this.initSpeechRecognition();
  }

  // ===== 설정 =====

  loadSettings() {
    this.settings = {
      customApiKey: localStorage.getItem('jpt_apiKey') || '',
      level: localStorage.getItem('jpt_level') || 'auto',
      theme: localStorage.getItem('jpt_theme') || 'light'
    };

    document.documentElement.setAttribute('data-theme', this.settings.theme);
    this.els.themeToggle.checked = this.settings.theme === 'dark';

    if (this.settings.customApiKey) {
      this.gemini.setCustomApiKey(this.settings.customApiKey);
      this.els.settingsApiKey.value = this.settings.customApiKey;
    }

    this.gemini.setLevel(this.settings.level);
    this.updateLevelUI(this.settings.level);
  }

  saveSettings() {
    localStorage.setItem('jpt_apiKey', this.settings.customApiKey);
    localStorage.setItem('jpt_level', this.settings.level);
    localStorage.setItem('jpt_theme', this.settings.theme);
  }

  updateLevelUI(level) {
    // 온보딩 레벨
    if (this.els.onboardingLevelSelector) {
      this.els.onboardingLevelSelector.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level === level);
      });
    }
    // 설정 레벨
    this.els.settingsLevelSelector.querySelectorAll('.level-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === level);
    });
    // 헤더 배지
    const labels = { auto: '자동', A1: 'A1', A2: 'A2', B1: 'B1', B2: 'B2', C1: 'C1', C2: 'C2' };
    this.els.levelBadge.textContent = labels[level] || '자동';
  }

  // ===== 이벤트 =====

  bindEvents() {
    // 온보딩 시작 버튼
    this.els.startBtn.addEventListener('click', () => this.handleStart());

    // 온보딩 레벨 버튼
    if (this.els.onboardingLevelSelector) {
      this.els.onboardingLevelSelector.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.settings.level = btn.dataset.level;
          this.gemini.setLevel(this.settings.level);
          this.updateLevelUI(this.settings.level);
          this.saveSettings();
        });
      });
    }

    // 채팅 입력
    this.els.messageInput.addEventListener('input', () => {
      this.autoResize(this.els.messageInput);
      this.els.sendBtn.disabled = !this.els.messageInput.value.trim();
    });
    this.els.messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.handleSend(); }
    });
    this.els.sendBtn.addEventListener('click', () => this.handleSend());

    // 마이크
    this.els.micBtn.addEventListener('click', () => this.toggleRecording());

    // 빠른 시작
    document.querySelectorAll('.quick-start-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.els.messageInput.value = btn.dataset.message;
        this.handleSend();
      });
    });

    // 헤더 버튼
    this.els.newChatBtn.addEventListener('click', () => this.handleNewChat());
    this.els.scenarioBtn.addEventListener('click', () => this.showScreen('scenario'));
    this.els.settingsBtn.addEventListener('click', () => this.showScreen('settings'));

    // 시나리오
    this.els.scenarioBackBtn.addEventListener('click', () => this.showScreen('chat'));

    // 설정
    this.els.settingsBackBtn.addEventListener('click', () => { this.applySettings(); this.showScreen('chat'); });
    this.els.toggleSettingsKey.addEventListener('click', () => {
      const inp = this.els.settingsApiKey;
      inp.type = inp.type === 'password' ? 'text' : 'password';
    });
    this.els.settingsLevelSelector.querySelectorAll('.level-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.settings.level = btn.dataset.level;
        this.gemini.setLevel(this.settings.level);
        this.updateLevelUI(this.settings.level);
        this.saveSettings();
      });
    });
    this.els.themeToggle.addEventListener('change', () => {
      this.settings.theme = this.els.themeToggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', this.settings.theme);
      this.saveSettings();
    });
    this.els.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('모든 대화 기록을 삭제하시겠습니까?')) {
        this.gemini.clearHistory();
        this.clearChatUI();
        this.showToast('대화 기록이 삭제되었습니다.');
      }
    });
  }

  // ===== 화면 전환 =====

  showScreen(name) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    if (this.screens[name]) {
      this.screens[name].classList.add('active');
    }
    if (name === 'chat') {
      setTimeout(() => this.els.messageInput.focus(), 300);
    }
  }

  // ===== 온보딩 =====

  handleStart() {
    this.saveSettings();
    this.showScreen('chat');
  }

  applySettings() {
    const key = this.els.settingsApiKey.value.trim();
    this.settings.customApiKey = key;
    this.gemini.setCustomApiKey(key);
    this.saveSettings();
  }

  // ===== 음성 인식 =====

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.els.micBtn.title = '이 브라우저에서는 음성 인식을 지원하지 않습니다';
      this.els.micBtn.style.opacity = '0.4';
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'ja-JP';
    this.recognition.interimResults = true;
    this.recognition.continuous = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      this.els.messageInput.value = finalTranscript || interimTranscript;
      this.els.sendBtn.disabled = !this.els.messageInput.value.trim();
      this.autoResize(this.els.messageInput);
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.els.micBtn.classList.remove('recording');

      // 최종 텍스트가 있으면 자동 전송
      const text = this.els.messageInput.value.trim();
      if (text) {
        this.handleSend();
      }
    };

    this.recognition.onerror = (event) => {
      this.isRecording = false;
      this.els.micBtn.classList.remove('recording');
      if (event.error === 'not-allowed') {
        this.showToast('🎤 마이크 권한을 허용해주세요');
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        this.showToast('🎤 음성 인식 오류: ' + event.error);
      }
    };
  }

  toggleRecording() {
    if (!this.recognition) {
      this.showToast('이 브라우저에서는 음성 인식을 지원하지 않습니다.\nChrome 브라우저를 사용해주세요.');
      return;
    }

    if (this.isRecording) {
      this.recognition.stop();
      this.isRecording = false;
      this.els.micBtn.classList.remove('recording');
    } else {
      this.els.messageInput.value = '';
      this.els.messageInput.placeholder = '🎤 듣고 있어요...';
      this.recognition.start();
      this.isRecording = true;
      this.els.micBtn.classList.add('recording');
    }
  }

  // ===== 채팅 =====

  async handleSend() {
    const message = this.els.messageInput.value.trim();
    if (!message || this.isProcessing) return;

    this.isProcessing = true;
    this.els.messageInput.value = '';
    this.els.messageInput.placeholder = '日本語で話してみよう！';
    this.els.sendBtn.disabled = true;
    this.autoResize(this.els.messageInput);

    if (this.els.welcomeMessage) this.els.welcomeMessage.classList.add('hidden');

    this.addMessage('user', message);
    this.showTyping(true);

    try {
      const response = await this.gemini.sendMessage(message);
      this.showTyping(false);
      this.addAIMessage(response);
    } catch (error) {
      this.showTyping(false);
      this.handleError(error);
    }

    this.isProcessing = false;
  }

  addMessage(role, text) {
    const el = document.createElement('div');
    el.classList.add('message', role);
    const content = document.createElement('div');
    content.classList.add('message-content');
    if (role === 'user') {
      content.innerHTML = `<div class="user-text">${this.escapeHtml(text)}</div>`;
    }
    el.appendChild(content);
    this.els.chatMessages.insertBefore(el, this.els.typingIndicator);
    this.scrollToBottom();
  }

  addAIMessage(response) {
    const el = document.createElement('div');
    el.classList.add('message', 'ai');
    const content = document.createElement('div');
    content.classList.add('message-content');

    let html = '';
    if (response.japanese) html += `<div class="ja-text">${this.escapeHtml(response.japanese)}</div>`;
    if (response.korean) html += `<div class="ko-text">${this.escapeHtml(response.korean)}</div>`;
    content.innerHTML = html;
    el.appendChild(content);

    if (response.feedback && (response.feedback.awkward || response.feedback.natural || response.feedback.raw)) {
      el.appendChild(this.createFeedbackCard(response.feedback));
    }

    this.els.chatMessages.insertBefore(el, this.els.typingIndicator);
    this.scrollToBottom();
  }

  createFeedbackCard(feedback) {
    const card = document.createElement('div');
    card.classList.add('feedback-card', 'open');

    let body = '';
    if (feedback.awkward && feedback.natural) {
      body = `
        <div class="feedback-item"><span class="fb-label">❌ 어색한 표현:</span> <span class="fb-value">${this.escapeHtml(feedback.awkward)}</span></div>
        <div class="feedback-item"><span class="fb-label">⭕ 자연스러운 표현:</span> <span class="fb-value">${this.escapeHtml(feedback.natural)}</span></div>
        ${feedback.reason ? `<div class="feedback-item"><span class="fb-label">💬 이유:</span> <span class="fb-value">${this.escapeHtml(feedback.reason)}</span></div>` : ''}`;
    } else {
      body = `<div class="feedback-item"><span class="fb-value">${this.escapeHtml(feedback.raw)}</span></div>`;
    }

    card.innerHTML = `
      <div class="feedback-header"><span>💡 교정 팁</span><span class="feedback-toggle">▲</span></div>
      <div class="feedback-body">${body}</div>`;

    card.querySelector('.feedback-header').addEventListener('click', () => {
      card.classList.toggle('open');
      card.querySelector('.feedback-toggle').textContent = card.classList.contains('open') ? '▲' : '▼';
    });

    return card;
  }

  handleNewChat() {
    if (this.gemini.conversationHistory.length > 0) {
      if (!confirm('새 대화를 시작하시겠습니까?')) return;
    }
    this.gemini.clearHistory();
    this.clearChatUI();
    this.els.headerMode.textContent = '프리토킹';
    this.showToast('새 대화가 시작되었습니다! 🎌');
  }

  clearChatUI() {
    this.els.chatMessages.querySelectorAll('.message:not(.typing-indicator)').forEach(m => m.remove());
    if (this.els.welcomeMessage) this.els.welcomeMessage.classList.remove('hidden');
  }

  // ===== 시나리오 =====

  renderScenarios() {
    if (typeof CATEGORIES !== 'undefined') {
      const tabs = CATEGORIES.map(c => `<button type="button" class="category-tab" data-category="${c.id}">${c.icon} ${c.label}</button>`).join('');
      this.els.categoryTabs.innerHTML = `<button type="button" class="category-tab active" data-category="all">전체</button>${tabs}`;
      this.els.categoryTabs.querySelectorAll('.category-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          this.els.categoryTabs.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          this.filterScenarios(tab.dataset.category);
        });
      });
    }
    if (typeof SCENARIOS !== 'undefined') this.renderScenarioCards(SCENARIOS);
  }

  renderScenarioCards(scenarios) {
    this.els.scenarioGrid.innerHTML = scenarios.map(s => `
      <div class="scenario-card" data-id="${s.id}">
        <div class="scenario-card-header">
          <span class="scenario-icon">${s.icon}</span>
          <span class="difficulty-badge difficulty-${s.difficulty.startsWith('A') ? 'beginner' : s.difficulty.startsWith('B') ? 'intermediate' : 'advanced'}">${s.difficulty}</span>
        </div>
        <div class="scenario-card-body">
          <div class="scenario-title">${s.title}</div>
          <div class="scenario-title-ja">${s.titleJa}</div>
          <div class="scenario-desc">${s.description}</div>
        </div>
      </div>`).join('');

    this.els.scenarioGrid.querySelectorAll('.scenario-card').forEach(card => {
      card.addEventListener('click', () => {
        const scenario = SCENARIOS.find(s => s.id === card.dataset.id);
        if (scenario) this.startScenario(scenario);
      });
    });
  }

  filterScenarios(category) {
    const filtered = category === 'all' ? SCENARIOS : SCENARIOS.filter(s => s.category === category);
    this.renderScenarioCards(filtered);
  }

  async startScenario(scenario) {
    this.gemini.clearHistory();
    this.clearChatUI();
    this.gemini.setScenario(scenario);
    this.els.headerMode.textContent = `🎭 ${scenario.title}`;
    this.showScreen('chat');

    this.isProcessing = true;
    if (this.els.welcomeMessage) this.els.welcomeMessage.classList.add('hidden');
    this.showTyping(true);

    try {
      const response = await this.gemini.startConversation();
      this.showTyping(false);
      this.addAIMessage(response);
    } catch (error) {
      this.showTyping(false);
      this.handleError(error);
    }
    this.isProcessing = false;
  }

  // ===== 유틸리티 =====

  showTyping(show) {
    this.els.typingIndicator.classList.toggle('hidden', !show);
    this.scrollToBottom();
  }

  scrollToBottom() {
    requestAnimationFrame(() => {
      this.els.chatMessages.scrollTop = this.els.chatMessages.scrollHeight;
    });
  }

  autoResize(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  }

  escapeHtml(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML.replace(/\n/g, '<br>');
  }

  showToast(message, duration = 3000) {
    this.els.toastMessage.textContent = message;
    this.els.toast.classList.remove('hidden');
    this.els.toast.classList.add('show');
    setTimeout(() => {
      this.els.toast.classList.remove('show');
      setTimeout(() => this.els.toast.classList.add('hidden'), 300);
    }, duration);
  }

  handleError(error) {
    const msgs = {
      'API_KEY_INVALID': '❌ API 키가 올바르지 않습니다. 설정에서 확인해주세요.',
      'RATE_LIMIT': '⏱️ 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      'EMPTY_RESPONSE': '🤔 응답을 생성하지 못했습니다. 다시 시도해주세요.',
      'SERVER_ERROR': '⚠️ 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    };
    const msg = msgs[error.message] || `⚠️ 오류: ${error.message}`;
    this.addSystemMessage(msg);
    this.showToast(msg);
  }

  addSystemMessage(text) {
    const el = document.createElement('div');
    el.classList.add('message', 'system');
    el.innerHTML = `<div class="message-content system-message">${this.escapeHtml(text)}</div>`;
    this.els.chatMessages.insertBefore(el, this.els.typingIndicator);
    this.scrollToBottom();
  }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
  try {
    window.app = new App();
  } catch (e) {
    console.error('앱 초기화 실패:', e);
    document.getElementById('start-btn')?.addEventListener('click', () => {
      document.getElementById('onboarding-screen').classList.remove('active');
      document.getElementById('chat-screen').classList.add('active');
    });
  }
});

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) await r.unregister();
      await navigator.serviceWorker.register('sw.js');
    } catch (e) { /* 무시 */ }
  });
}
