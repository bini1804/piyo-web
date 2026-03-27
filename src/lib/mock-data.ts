import type { ChatResponseMetadata } from "@/types";

/**
 * 피요 백엔드 없이 프론트엔드 테스트용 목 응답
 * NEXT_PUBLIC_MOCK_MODE=true 일 때 사용
 */

const MOCK_ANSWERS: Record<string, { answer: string; metadata: ChatResponseMetadata }> = {
  default: {
    answer:
      "안녕하세요! 피요예요 🐥\n\n피부 고민을 자세히 알려주시면 **맞춤형 제품**과 **시술**을 추천해드릴게요.\n\n예를 들어 '건조한 피부에 좋은 세럼 추천해줘' 같이 물어보시면 딱이에요!",
    metadata: {},
  },
  serum: {
    answer:
      "건조한 피부에는 **히알루론산 기반 세럼**이 가장 효과적이에요.\n\n피부 장벽을 강화하면서 수분을 끌어당기는 성분이라, 세안 직후 젖은 피부에 바르면 효과가 극대화됩니다.\n\n아래 제품들을 추천드릴게요 👇",
    metadata: {
      recommended_products: [
        {
          recommendation: "나이아신 트라넥삼산 13% 세럼 30ml",
          type: "화장품",
          key: "C_whiteningserum7",
          category: "세럼",
          concern: "피지, 모공 고민",
          reason: "나이아신아마이드와 트라넥삼산이 피지 조절과 모공 개선에 효과적입니다.",
        },
        {
          recommendation: "더마팩토리 나이아신아마이드 20% 세럼",
          type: "화장품",
          key: "C_whiteningserum8",
          category: "세럼",
          concern: "피지, 모공 고민",
          reason: "고함량 나이아신아마이드로 피지 분비를 조절하고 모공을 축소합니다.",
        },
      ],
      status: "RECOMMENDED",
    },
  },
  pore: {
    answer:
      "모공 고민이시군요! 모공을 줄이는 방법은 크게 **홈케어**와 **시술** 두 가지로 나눌 수 있어요.\n\n### 홈케어\n- **BHA(살리실산)** 성분이 들어간 토너로 각질 관리\n- **나이아신아마이드** 세럼으로 피지 조절\n- 주 1~2회 클레이 마스크\n\n### 시술 추천\n아래 시술들이 모공 축소에 효과적이에요 👇",
    metadata: {
      recommended_procedures: [
        {
          recommendation: "프락셀 레이저",
          type: "시술",
          key: "T_fraxel1",
          category: "레이저",
          concern: "모공, 피부결",
          reason: "미세 레이저로 콜라겐 리모델링을 유도해 모공을 축소합니다.",
        },
      ],
      recommended_products: [
        {
          recommendation: "BHA 블랙헤드 파워리퀴드",
          type: "화장품",
          key: "C_bha_toner1",
          category: "토너",
          concern: "모공, 블랙헤드",
          reason: "모공 속 노폐물 제거에 효과적입니다.",
        },
      ],
      status: "RECOMMENDED",
    },
  },
};

/** 쿼리에 따라 적절한 목 응답 반환 */
export function getMockResponse(query: string): {
  answer: string;
  metadata: ChatResponseMetadata;
} {
  const q = query.toLowerCase();
  if (q.includes("세럼") || q.includes("건조") || q.includes("수분")) {
    return MOCK_ANSWERS.serum;
  }
  if (q.includes("모공") || q.includes("블랙헤드") || q.includes("피지")) {
    return MOCK_ANSWERS.pore;
  }
  return MOCK_ANSWERS.default;
}
