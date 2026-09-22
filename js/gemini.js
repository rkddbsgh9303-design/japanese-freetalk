// 일본어 프리토킹 AI 튜터 - Gemini API 래퍼
class GeminiAPI {
  constructor() {
    this.customApiKey = '';
    this.model = 'gemini-2.0-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.proxyUrl = '/api/chat';
    this.conversationHistory = [];
    this.currentLevel = 'auto';
    this.currentScenario = null;
  }

  setCustomApiKey(key) {
    this.customApiKey = (key || '').trim();
  }

  setLevel(level) {
    this.currentLevel = level;
  }

  setScenario(scenario) {
    this.currentScenario = scenario;
  }

  clearHistory() {
    this.conversationHistory = [];
    this.currentScenario = null;
  }

  getSystemPrompt() {
    let levelInstruction = '';

    if (this.currentLevel === 'auto') {
      levelInstruction = '학습자가 명확히 레벨을 지정하지 않았으므로, 초기 대화는 A2~B1 난이도로 시작한 후 학습자의 답변 수준을 보고 동적으로 난이도를 전환하라.';
    } else {
      const levelMap = {
        'A1': 'A1-A2 (초급 학습자) 규칙을 적용하라.',
        'A2': 'A1-A2 (초급 학습자) 규칙을 적용하라.',
        'B1': 'B1-B2 (중급 학습자) 규칙을 적용하라.',
        'B2': 'B1-B2 (중급 학습자) 규칙을 적용하라.',
        'C1': 'C1-C2 (고급 학습자) 규칙을 적용하라.',
        'C2': 'C1-C2 (고급 학습자) 규칙을 적용하라.'
      };
      levelInstruction = `현재 학습자의 레벨은 ${this.currentLevel}이다. ${levelMap[this.currentLevel]}`;
    }

    let scenarioInstruction = '';
    if (this.currentScenario) {
      scenarioInstruction = `\n\n[현재 역할극 시나리오]\n${this.currentScenario.initialPrompt}`;
    }

    return `너는 학습자의 일본어 프리토킹 실력을 향상시키기 위해 설계된 친절하고 인내심 있는 '원어민 일본어 회화 튜터 및 대화 파트너'이다.
학습자가 부담 없이 대화할 수 있도록 친근하고 자연스럽게 대화를 이끌며, 학습자의 수준에 맞추어 언어 난이도를 동적으로 조절한다.

[수준별 규칙]
A1-A2 (초급 학습자):
- 모든 일본어 응답은 2문장 이내의 단문으로 구성한다.
- 모든 한자 위에는 괄호 형식으로 후리가나(루비)를 병기한다. (예: 日本(にほん))
- 정중어(です・ます) 체계를 철저히 유지하며, JLPT N5~N4 수준의 기본 어휘 및 조사를 사용한다.
- 한국어 번역을 일본어 문장 아래에 항상 함께 제공한다.

B1-B2 (중급 학습자):
- 자연스러운 대화 속도로 전개하며, JLPT N3~N2 어휘 및 구문(수동, 사역, 가능형 등)을 활용한다.
- N2 이하의 생소한 한자에만 선택적으로 후리가나를 표기한다.
- 상황에 맞추어 정중어와 구어체(반말)를 적절히 혼용하며 자연스러운 관용구를 제안한다.
- 한국어 번역을 일본어 문장 아래에 함께 제공한다.

C1-C2 (고급 학습자):
- 원어민 수준의 자연스럽고 빠르며 다채로운 표현을 사용한다.
- 후리가나 표기를 제공하지 않는다.
- 비즈니스 고급 경어(존경어/겸양어) 및 문화적 뉘앙스가 담긴 완곡한 표현을 완벽히 적용한다.
- 한국어 번역을 제공하지 않는다.

${levelInstruction}

[대화 진행 규칙]
1. 대화 진행(Flow) 최우선: 대화 중에는 학습자의 발화 오류를 즉시 지적하여 대화 흐름을 끊지 않는다. 학습자의 의도를 미러링(Mirroring)하여 자연스럽게 대화를 이어간다.
2. 질문 유도: 매 턴의 응답 끝에는 학습자가 쉽게 답변할 수 있는 열린 질문(Open-ended question)을 1개 포함하여 대화를 지속시킨다.
3. 단계별 교정: 턴이 끝난 후, 학습자의 발화에서 결정적인 오류가 있었을 경우에만 답변 하단에 교정 팁을 제시한다.

[출력 형식 - 반드시 이 형식을 따를 것]
응답은 반드시 다음 형식으로 출력하라. 각 섹션은 정확히 이 마커로 구분되어야 한다:

【日本語】
(일본어 대화 문장 및 질문)

【韓国語訳】 (C1-C2 레벨에서는 이 섹션을 출력하지 마라)
(일본어 응답에 대한 자연스러운 한국어 번역)

【💡教正】 (학습자의 직전 발화에 어색함이나 오류가 있었을 경우에만 출력)
어색한 표현: "학습자 표현"
자연스러운 표현: "원어민 표현"
이유: (간단한 어감 또는 문법 설명)

[절대 금지]
- AI로서의 정형화된 서두("AI 언어 모델로서..." 등)는 절대로 출력하지 않는다.
- 마크다운 형식(**, ##, \`\`\` 등)을 사용하지 않는다. 순수 텍스트로만 출력한다.
${scenarioInstruction}`;
  }

  async sendMessage(userMessage) {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    try {
      let data;

      if (this.customApiKey) {
        // 커스텀 키: 직접 Gemini API 호출
        data = await this._callDirect();
      } else {
        // 서버 프록시 경유
        data = await this._callProxy();
      }

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        this.conversationHistory.pop();
        throw new Error('EMPTY_RESPONSE');
      }

      const responseText = data.candidates[0].content.parts[0].text;

      this.conversationHistory.push({
        role: 'model',
        parts: [{ text: responseText }]
      });

      // 히스토리 제한 (최근 20턴 = 40메시지)
      if (this.conversationHistory.length > 40) {
        this.conversationHistory = this.conversationHistory.slice(-40);
      }

      return this.parseResponse(responseText);
    } catch (error) {
      this.conversationHistory.pop();
      throw error;
    }
  }

  async _callProxy() {
    const response = await fetch(this.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: this.getSystemPrompt(),
        contents: this.conversationHistory,
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 429) throw new Error('RATE_LIMIT');
      if (response.status === 500) throw new Error('SERVER_ERROR');
      throw new Error(err.error || `API_ERROR: ${response.status}`);
    }

    return response.json();
  }

  async _callDirect() {
    const requestBody = {
      system_instruction: { parts: [{ text: this.getSystemPrompt() }] },
      contents: this.conversationHistory,
      generationConfig: { temperature: 0.85, topP: 0.95, topK: 40, maxOutputTokens: 1024 },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    };

    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.customApiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      if (response.status === 400 || response.status === 403) throw new Error('API_KEY_INVALID');
      if (response.status === 429) throw new Error('RATE_LIMIT');
      throw new Error(`API_ERROR: ${response.status}`);
    }

    return response.json();
  }

  parseResponse(text) {
    const result = { japanese: '', korean: '', feedback: null, raw: text };

    const jaMatch = text.match(/【日本語】\s*([\s\S]*?)(?=【韓国語訳】|【💡教正】|$)/);
    if (jaMatch) {
      result.japanese = jaMatch[1].trim();
    } else {
      result.japanese = text.replace(/【韓国語訳】[\s\S]*?(?=【|$)/g, '').replace(/【💡教正】[\s\S]*/g, '').trim();
    }

    const koMatch = text.match(/【韓国語訳】\s*([\s\S]*?)(?=【💡教正】|$)/);
    if (koMatch) result.korean = koMatch[1].trim();

    const fbMatch = text.match(/【💡教正】\s*([\s\S]*?)$/);
    if (fbMatch) {
      const fbText = fbMatch[1].trim();
      const awkwardMatch = fbText.match(/어색한 표현[：:]\s*["「]?([^"」\n]+)["」]?/);
      const naturalMatch = fbText.match(/자연스러운 표현[：:]\s*["「]?([^"」\n]+)["」]?/);
      const reasonMatch = fbText.match(/이유[：:]\s*(.+)/);
      result.feedback = {
        raw: fbText,
        awkward: awkwardMatch ? awkwardMatch[1].trim() : '',
        natural: naturalMatch ? naturalMatch[1].trim() : '',
        reason: reasonMatch ? reasonMatch[1].trim() : ''
      };
    }

    if (!result.japanese) result.japanese = text;
    return result;
  }

  async startConversation() {
    const greeting = this.currentScenario
      ? `역할극을 시작합니다. 시나리오: ${this.currentScenario.title}`
      : 'こんにちは';
    return this.sendMessage(greeting);
  }
}
