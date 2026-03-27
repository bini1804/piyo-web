// 피부타입 4개 (민감성 없음)
export const SKIN_TYPES = [
  {
    value: "dry",
    label: "건성",
    desc: "피부가 전체적으로 건조하고 당긴다.",
    q1: {
      text: "보습제(크림)을 발라도 부족하다고 느낄 때가 있나요?",
      left: "가끔 그래요",
      right: "자주 그래요",
    },
  },
  {
    value: "oily",
    label: "지성",
    desc: "얼굴이 자주 번들거리고 유분이 많다.",
    q1: {
      text: "코, 이마 등 T존 부위가 늘 번들거리나요?",
      left: "가끔 그래요",
      right: "자주 그래요",
    },
  },
  {
    value: "combination",
    label: "복합성",
    desc: "T존은 번들거리고, U존은 당기는 복합적인 느낌이다.",
    q1: {
      text: "이마/코(T존)는 번들거리는데 볼/입가(U존)는 건조하거나 당기나요?",
      left: "가끔 그래요",
      right: "자주 그래요",
    },
  },
  {
    value: "normal",
    label: "중성",
    desc: "특별히 불편한 점 없이 편안하다.",
    q1: {
      text: "특별한 보습이나 유분 조절 없이도 피부가 편안한 편인가요?",
      left: "불편해요",
      right: "편안해요",
    },
  },
] as const;

// 민감도 공통 질문 (4개 타입 모두 동일)
export const SENSITIVITY_QUESTION = {
  text: "유난히 민감함이나 자극을 느끼는 경우가 얼마나 있나요?",
  sub: "(가려움, 잦은 트러블, 붉어짐 등)",
  left: "가끔 그래요",
  right: "자주 그래요",
} as const;

// 민감도 5단계 설명 (하단 카드용)
export const SENSITIVITY_LEVELS = [
  {
    level: 1,
    name: "저항성",
    nameEn: "Resistant",
    description:
      "새로운 화장품을 써도 뒤집어진 적이 없고, 세안 후 아무것도 안 발라도 당기지 않아요.",
  },
  {
    level: 2,
    name: "건강",
    nameEn: "Healthy",
    description:
      "평소엔 괜찮지만, 아주 피곤하거나 환절기에만 가끔 특정 부위가 살짝 붉어질 때가 있어요.",
  },
  {
    level: 3,
    name: "경계",
    nameEn: "Mildly Sensitive",
    description:
      "특정 성분(알코올, 향료)에 따끔함을 느끼며, 세안 직후 바로 보습제를 바르지 않으면 얼굴이 팽팽해져요.",
  },
  {
    level: 4,
    name: "심한 민감",
    nameEn: "Sensitive",
    description:
      "찬물로만 씻어도 얼굴이 화끈거리고, 평소 쓰던 크림도 컨디션에 따라 따끔하게 느껴져요. 시술 후 붉은기가 3일 이상 가요.",
  },
  {
    level: 5,
    name: "병적 민감",
    nameEn: "Hypersensitive",
    description:
      "아무것도 안 해도 얼굴에 열감이 있고 가려워요. 과거에 주사비나 지루성 피부염 진단을 받았거나 스테로이드 연고를 써본 적이 있어요.",
  },
] as const;

// 고민 카테고리
export const CONCERN_CATEGORIES = [
  {
    category: "여드름",
    emoji: "🔴",
    items: [
      "염증성 여드름",
      "좁쌀 여드름",
      "패인 흉터",
      "빨간 색소 침착(PIE)",
      "갈색 색소 침착(PIH)",
    ],
  },
  {
    category: "색소",
    emoji: "🟤",
    items: ["잡티", "흑자", "주근깨", "기미"],
  },
  {
    category: "모공/피지",
    emoji: "🟡",
    items: ["모공 확장", "피지 과다 분비", "블랙헤드"],
  },
  {
    category: "주름",
    emoji: "〰️",
    items: ["잔주름", "눈가", "이마/미간", "팔자/마리오넷"],
  },
  {
    category: "탄력",
    emoji: "💪",
    items: ["피부 늘어짐", "피부 탄력 저하"],
  },
  {
    category: "얼굴형",
    emoji: "😊",
    items: ["볼살", "이중턱", "심부볼"],
  },
  {
    category: "피부(결)",
    emoji: "🌿",
    items: ["거친 피부결", "각질 들뜸", "홍조"],
  },
  {
    category: "기타",
    emoji: "✨",
    items: ["제모", "점", "(편평)사마귀 / 비립종", "쥐젖"],
  },
] as const;
