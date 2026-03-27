export type Messages = {
  common: {
    appName: string;
    appTagline: string;
    send: string;
    cancel: string;
    next: string;
    back: string;
    skip: string;
    complete: string;
    close: string;
    login: string;
    logout: string;
    settings: string;
    newChat: string;
  };
  welcome: { greeting: string; description: string };
  chat: {
    placeholder: string;
    disclaimer: string;
    recommendedProducts: string;
    recommendedProcedures: string;
  };
  consent: { title: string; subtitle: string };
  survey: {
    basicInfo: string;
    skinType: string;
    concerns: string;
    sensitivity: string;
  };
  sidebar: {
    saveHistoryTitle: string;
    saveHistoryDesc: string;
    noChatsYet: string;
  };
};

const ko = {
  common: {
    appName: "피요",
    appTagline: "나만의 AI 뷰티 컨시어지",
    send: "보내기",
    cancel: "취소",
    next: "다음",
    back: "이전",
    skip: "건너뛰기",
    complete: "완료",
    close: "닫기",
    login: "로그인",
    logout: "로그아웃",
    settings: "설정",
    newChat: "새 대화",
  },
  welcome: {
    greeting: "안녕하세요! 피요예요 🐥",
    description:
      "피부 고민이나 궁금한 점을 편하게 물어보세요.\n맞춤형 스킨케어, 시술, 병원까지 추천해드릴게요.",
  },
  chat: {
    placeholder: "피요에게 물어보세요...",
    disclaimer: "피요는 AI 뷰티 컨시어지입니다. 의료 진단을 대체하지 않습니다.",
    recommendedProducts: "추천 제품",
    recommendedProcedures: "추천 시술",
  },
  consent: {
    title: "피요를 시작하기 전에",
    subtitle: "원활한 서비스를 위해 아래 동의가 필요해요",
  },
  survey: {
    basicInfo: "기본 정보를 알려주세요",
    skinType: "피부 타입을 선택해주세요",
    concerns: "피부 고민을 선택해주세요",
    sensitivity: "피부 민감도를 알려주세요",
  },
  sidebar: {
    saveHistoryTitle: "대화 기록을 저장하려면",
    saveHistoryDesc: "로그인해주세요",
    noChatsYet: "아직 대화가 없어요",
  },
} satisfies Messages;

export default ko;
