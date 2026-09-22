// 일본어 프리토킹 AI 튜터 - 역할극 시나리오 데이터
const SCENARIOS = [
  // === 일상회화 (日常会話) ===
  {
    id: 'self-intro',
    title: '자기소개',
    titleJa: '自己紹介',
    category: 'daily',
    categoryLabel: '일상회화',
    icon: '👋',
    difficulty: 'A2',
    description: '처음 만난 사람에게 자기소개를 해보세요.',
    descriptionJa: '初めて会った人に自己紹介をしてみましょう。',
    initialPrompt: '당신은 일본의 한 카페에서 방금 옆자리에 앉은 사람입니다. 학습자에게 먼저 일본어로 인사하고 자기소개를 해달라고 해주세요. 자연스러운 카페 분위기로 대화해주세요.'
  },
  {
    id: 'weather-talk',
    title: '날씨 이야기',
    titleJa: '天気の話',
    category: 'daily',
    categoryLabel: '일상회화',
    icon: '🌤️',
    difficulty: 'A1',
    description: '오늘 날씨에 대해 이야기해보세요.',
    descriptionJa: '今日の天気について話してみましょう。',
    initialPrompt: '당신은 학습자의 일본인 이웃입니다. 아침에 현관 앞에서 마주쳤습니다. 먼저 인사하고 오늘 날씨에 대해 이야기를 시작해주세요.'
  },
  {
    id: 'hobby',
    title: '취미 이야기',
    titleJa: '趣味の話',
    category: 'daily',
    categoryLabel: '일상회화',
    icon: '🎨',
    difficulty: 'A2',
    description: '서로의 취미에 대해 이야기해보세요.',
    descriptionJa: 'お互いの趣味について話してみましょう。',
    initialPrompt: '당신은 학습자와 같은 동아리에 새로 들어온 일본인입니다. 자연스럽게 취미에 대한 대화를 시작해주세요.'
  },
  {
    id: 'weekend-plans',
    title: '주말 계획',
    titleJa: '週末の予定',
    category: 'daily',
    categoryLabel: '일상회화',
    icon: '📅',
    difficulty: 'B1',
    description: '주말에 뭘 할 건지 이야기해보세요.',
    descriptionJa: '週末に何をするか話してみましょう。',
    initialPrompt: '당신은 학습자의 일본인 친구입니다. 금요일 오후에 만나서 주말 계획에 대해 이야기합니다. 먼저 주말에 뭐 할 건지 물어봐주세요.'
  },

  // === 여행 (旅行) ===
  {
    id: 'restaurant',
    title: '식당 주문',
    titleJa: 'レストランで注文',
    category: 'travel',
    categoryLabel: '여행',
    icon: '🍜',
    difficulty: 'A2',
    description: '일본 식당에서 음식을 주문해보세요.',
    descriptionJa: '日本のレストランで食事を注文してみましょう。',
    initialPrompt: '당신은 일본 라멘 가게의 점원입니다. 학습자가 손님으로 들어왔습니다. "いらっしゃいませ！"로 맞이하고, 메뉴 안내하며 주문을 받아주세요. 메뉴: 味噌ラーメン(900円), 醤油ラーメン(850円), 塩ラーメン(850円), 餃子(400円), ビール(500円)'
  },
  {
    id: 'hotel-checkin',
    title: '호텔 체크인',
    titleJa: 'ホテルチェックイン',
    category: 'travel',
    categoryLabel: '여행',
    icon: '🏨',
    difficulty: 'B1',
    description: '호텔에서 체크인을 해보세요.',
    descriptionJa: 'ホテルでチェックインしてみましょう。',
    initialPrompt: '당신은 도쿄의 호텔 프론트 데스크 직원입니다. 학습자가 체크인하러 왔습니다. 정중하게 맞이하고, 예약 확인, 여권 확인, 방 안내 등의 절차를 진행해주세요.'
  },
  {
    id: 'ask-directions',
    title: '길 묻기',
    titleJa: '道を聞く',
    category: 'travel',
    categoryLabel: '여행',
    icon: '🗺️',
    difficulty: 'A2',
    description: '일본에서 길을 물어보세요.',
    descriptionJa: '日本で道を聞いてみましょう。',
    initialPrompt: '당신은 도쿄역 근처를 지나가는 일본인입니다. 학습자가 길을 물어봅니다. 친절하게 도쿄 스카이트리까지 가는 길을 알려주세요. 지하철 타는 법을 포함해서요.'
  },
  {
    id: 'convenience-store',
    title: '편의점 쇼핑',
    titleJa: 'コンビニで買い物',
    category: 'travel',
    categoryLabel: '여행',
    icon: '🏪',
    difficulty: 'A1',
    description: '일본 편의점에서 물건을 사보세요.',
    descriptionJa: '日本のコンビニで買い物してみましょう。',
    initialPrompt: '당신은 일본 편의점(세븐일레븐) 점원입니다. 학습자가 손님으로 왔습니다. 인사하고, 포인트 카드 여부, 봉투 필요 여부, 따뜻하게 데울지 등을 물어봐주세요.'
  },
  {
    id: 'train-station',
    title: '기차역에서',
    titleJa: '駅で',
    category: 'travel',
    categoryLabel: '여행',
    icon: '🚃',
    difficulty: 'B1',
    description: '기차역에서 표를 사거나 정보를 물어보세요.',
    descriptionJa: '駅で切符を買ったり情報を聞いたりしてみましょう。',
    initialPrompt: '당신은 JR 신주쿠역의 역무원(駅員)입니다. 학습자가 교토까지 가는 신칸센 표를 사려고 합니다. 출발 시간, 좌석 종류(지정석/자유석), 편도/왕복 등을 물어보며 안내해주세요.'
  },

  // === 비즈니스 (ビジネス) ===
  {
    id: 'job-interview',
    title: '취업 면접',
    titleJa: '就職面接',
    category: 'business',
    categoryLabel: '비즈니스',
    icon: '💼',
    difficulty: 'B2',
    description: '일본 회사 면접을 연습해보세요.',
    descriptionJa: '日本の会社の面接を練習してみましょう。',
    initialPrompt: '당신은 일본 IT 회사의 인사 담당자입니다. 학습자가 면접을 보러 왔습니다. 정중한 비즈니스 일본어로 자기소개, 지원 동기, 강점/약점 등의 전형적인 면접 질문을 해주세요.'
  },
  {
    id: 'business-meeting',
    title: '비즈니스 미팅',
    titleJa: 'ビジネスミーティング',
    category: 'business',
    categoryLabel: '비즈니스',
    icon: '🤝',
    difficulty: 'C1',
    description: '일본 비즈니스 미팅에 참석해보세요.',
    descriptionJa: '日本のビジネスミーティングに参加してみましょう。',
    initialPrompt: '당신은 일본 기업의 부장(部長)입니다. 학습자는 한국 기업에서 온 담당자입니다. 신규 프로젝트 제휴에 관한 미팅을 시작합니다. 경어를 사용하며, 명함 교환부터 시작해주세요.'
  },
  {
    id: 'phone-call',
    title: '전화 응대',
    titleJa: '電話応対',
    category: 'business',
    categoryLabel: '비즈니스',
    icon: '📞',
    difficulty: 'B2',
    description: '일본어로 비즈니스 전화를 해보세요.',
    descriptionJa: '日本語でビジネスの電話をしてみましょう。',
    initialPrompt: '당신은 일본 거래처의 직원입니다. 학습자가 전화를 걸어옵니다. 전형적인 일본 비즈니스 전화 응대 절차(회사명+이름 밝히기, 상대 확인, 용건 확인 등)를 따라주세요.'
  },

  // === 문화·토론 (文化・討論) ===
  {
    id: 'anime-talk',
    title: '애니메이션 토크',
    titleJa: 'アニメトーク',
    category: 'culture',
    categoryLabel: '문화·토론',
    icon: '🎬',
    difficulty: 'B1',
    description: '좋아하는 애니메이션에 대해 이야기해보세요.',
    descriptionJa: '好きなアニメについて話してみましょう。',
    initialPrompt: '당신은 애니메이션을 좋아하는 일본인 친구입니다. 학습자에게 최근 본 애니메이션이 뭔지 물어보고, 추천 작품에 대해 열정적으로 이야기해주세요.'
  },
  {
    id: 'japanese-culture',
    title: '일본 문화 토론',
    titleJa: '日本文化について',
    category: 'culture',
    categoryLabel: '문화·토론',
    icon: '⛩️',
    difficulty: 'B2',
    description: '일본 문화(마쓰리, 예절, 음식 등)에 대해 토론해보세요.',
    descriptionJa: '日本の文化（祭り、マナー、食べ物など）について話してみましょう。',
    initialPrompt: '당신은 일본 문화에 대해 잘 아는 일본인 대학생입니다. 학습자와 한일 문화 차이에 대해 자유롭게 이야기합니다. 먼저 일본에서 경험한 문화적 차이가 있는지 물어봐주세요.'
  },
  {
    id: 'news-discussion',
    title: '뉴스 토론',
    titleJa: 'ニュースについて',
    category: 'culture',
    categoryLabel: '문화·토론',
    icon: '📰',
    difficulty: 'C1',
    description: '최근 뉴스나 사회 이슈에 대해 토론해보세요.',
    descriptionJa: '最近のニュースや社会問題について話してみましょう。',
    initialPrompt: '당신은 시사에 관심이 많은 일본인 직장인입니다. 학습자와 최근 화제가 된 뉴스(기술, 환경, 사회 등)에 대해 깊이 있는 토론을 합니다. 자연스럽게 의견을 교환해주세요.'
  }
];

// 카테고리 정보
const CATEGORIES = [
  { id: 'daily', label: '일상회화', labelJa: '日常会話', icon: '💬' },
  { id: 'travel', label: '여행', labelJa: '旅行', icon: '✈️' },
  { id: 'business', label: '비즈니스', labelJa: 'ビジネス', icon: '💼' },
  { id: 'culture', label: '문화·토론', labelJa: '文化・討論', icon: '🎌' }
];
