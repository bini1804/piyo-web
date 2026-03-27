"use client";

import { X } from "lucide-react";

interface TermsModalProps {
  onClose: () => void;
}

export default function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden bg-white shadow-[0_8px_40px_rgba(0,0,0,0.15)]"
        style={{ borderRadius: "20px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 브랜드 컬러 상단 바 */}
        <div className="h-1 w-full shrink-0 bg-[#F4CB4B]" />

        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h2 className="text-base font-bold text-[#1a1a1a]">이용약관</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#f5f5f5] transition-colors"
          >
            <X size={18} color="#888" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-sm leading-relaxed text-[#444] space-y-5">
          <p className="text-xs text-[#888]">시행일: 2026년 3월 27일</p>

          <Section title="제1조 (목적)">
            <p>
              본 약관은 Wellness Aging(이하 '회사')이 제공하는 피요(Piyo) AI
              피부 컨시어지 서비스의 이용 조건 및 절차에 관한 사항을 규정함을
              목적으로 합니다.
            </p>
          </Section>

          <Section title="제2조 (서비스의 내용)">
            <p>서비스는 다음의 기능을 제공합니다.</p>
            <ul className="mt-2 space-y-1 list-none">
              <li>• AI 기반 맞춤 화장품·시술 추천</li>
              <li>• 피부 타입·고민 기반 개인화 채팅 서비스</li>
              <li>• 추천 제품 및 시술 상세 정보 조회</li>
              <li>• 피부 설문 기반 피요 메모리 개인화</li>
            </ul>
            <p className="mt-3">
              본 서비스는 의료 행위가 아니며, 전문의의 진단을 대체하지
              않습니다. 추천 결과는 참고 목적의 정보로만 활용해주시기 바랍니다.
            </p>
          </Section>

          <Section title="제3조 (이용자의 의무)">
            <p>이용자는 다음 사항을 준수해야 합니다.</p>
            <ul className="mt-2 space-y-1 list-none">
              <li>• 타인의 정보를 도용하여 서비스를 이용하지 않을 것</li>
              <li>• 서비스를 의료 진단 목적으로 사용하지 않을 것</li>
              <li>• 서비스의 정상적인 운영을 방해하지 않을 것</li>
              <li>• 허위 정보를 입력하여 추천 결과를 왜곡하지 않을 것</li>
            </ul>
          </Section>

          <Section title="제4조 (면책 조항)">
            <ul className="space-y-1 list-none">
              <li>• AI 추천 결과는 참고 정보이며 정확성을 보장하지 않습니다.</li>
              <li>• 추천 제품·시술은 참고 목적이며 최종 결정은 이용자의 판단에 따릅니다.</li>
              <li>• 서비스 이용으로 인한 피부 트러블 등에 대해 회사는 책임을 지지 않습니다.</li>
              <li>• 심각한 피부 문제가 의심되는 경우 반드시 피부과 전문의와 상담하시기 바랍니다.</li>
            </ul>
          </Section>

          <Section title="제5조 (지적재산권)">
            <p>
              서비스의 소프트웨어, AI 모델, 디자인 및 콘텐츠에 대한
              지적재산권은 Wellness Aging에 귀속됩니다. 이용자의 채팅 대화 및
              설문 데이터에 대한 권리는 이용자에게 귀속됩니다.
            </p>
          </Section>

          <Section title="제6조 (서비스 변경 및 중단)">
            <ul className="space-y-1 list-none">
              <li>• 회사는 서비스 내용을 변경하거나 중단할 수 있습니다.</li>
              <li>• 중요한 변경 시 사전에 공지합니다.</li>
            </ul>
          </Section>

          <Section title="제7조 (준거법 및 관할)">
            <p>
              본 약관의 해석 및 분쟁 해결은 대한민국 법률에 따르며, 분쟁 발생
              시 서울중앙지방법원을 제1심 관할법원으로 합니다.
            </p>
          </Section>

          <div className="pt-2 text-xs text-[#888] space-y-1">
            <p>문의: cs@wellnessaging.co.kr</p>
            <p>운영사: Wellness Aging</p>
          </div>
        </div>

        {/* 하단 확인 버튼 */}
        <div className="shrink-0 border-t border-[#f0f0f0] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl py-3 text-sm font-semibold text-[#1a1a1a] transition-opacity hover:opacity-90"
            style={{ background: "#F4CB4B" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-bold text-[#1a1a1a] mb-2">{title}</p>
      <div className="text-[#555] space-y-1">{children}</div>
    </div>
  );
}
