"use client";

import { X } from "lucide-react";

interface PrivacyModalProps {
  onClose: () => void;
}

export default function PrivacyModal({ onClose }: PrivacyModalProps) {
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
          <h2 className="text-base font-bold text-[#1a1a1a]">개인정보 처리방침</h2>
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
          <p>
            피요(Piyo, 이하 '서비스')는 이용자의 개인정보를 중요시하며,
            「개인정보 보호법」을 준수합니다.
          </p>

          <Section title="1. 수집하는 개인정보 항목">
            <ul className="space-y-1 list-none">
              <li>• 소셜 계정 정보(카카오, 구글 로그인): 닉네임, 이메일</li>
              <li>• 설문 응답: 성별, 나이, 피부타입, 피부 고민, 민감도</li>
              <li>• 별명: 서비스 내 호칭으로 사용하는 닉네임</li>
              <li>• 서비스 이용 기록: AI 채팅 대화 내용, 추천 제품/시술 조회 기록</li>
            </ul>
          </Section>

          <Section title="2. 수집 및 이용 목적">
            <ul className="space-y-1 list-none">
              <li>• AI 맞춤 피부 추천 서비스 제공</li>
              <li>• 피부 타입·고민 기반 화장품·시술 추천</li>
              <li>• 서비스 개선 및 AI 모델 고도화 (비식별 처리)</li>
              <li>• 재방문 시 개인화된 경험 제공</li>
            </ul>
          </Section>

          <Section title="3. 보유 및 이용 기간">
            <ul className="space-y-1 list-none">
              <li>• 소셜 계정 정보: 회원 탈퇴 시까지</li>
              <li>• 설문 응답 데이터: 회원 탈퇴 시까지</li>
              <li>• 채팅 대화 기록: 회원 탈퇴 시까지</li>
              <li>• 별명: 회원 탈퇴 시까지</li>
            </ul>
          </Section>

          <Section title="4. 개인정보의 제3자 제공">
            <p>
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지
              않습니다. 다만 다음의 경우는 예외입니다.
            </p>
            <ul className="mt-2 space-y-1 list-none">
              <li>• 이용자가 사전에 동의한 경우</li>
              <li>• 법령에 의해 요구되는 경우</li>
            </ul>
            <p className="mt-3">
              서비스는 원활한 운영을 위해 아래와 같이 처리를 위탁합니다.
            </p>
            <ul className="mt-2 space-y-1 list-none">
              <li>• Amazon Web Services (미국): 데이터 저장 (RDS, S3)</li>
              <li>• OpenAI, Inc. (미국): AI 추천 응답 생성</li>
              <li>• Vercel, Inc. (미국): 웹 서비스 호스팅</li>
            </ul>
          </Section>

          <Section title="5. 개인정보의 국외 이전">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-[#1a1a1a] mb-1">[1] AI 추천 응답 생성</p>
                <ul className="space-y-0.5 list-none">
                  <li>• 이전받는 자: OpenAI, Inc.</li>
                  <li>• 이전 국가: 미국</li>
                  <li>• 이전 항목: 채팅 대화 내용, 피부 설문 데이터</li>
                  <li>• 이전 목적: AI 기반 맞춤 추천 응답 생성</li>
                  <li>• 이전 방법: API를 통한 암호화 전송 (TLS)</li>
                  <li>• 보유 기간: API 처리 완료 즉시 삭제</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-[#1a1a1a] mb-1">[2] 데이터 저장</p>
                <ul className="space-y-0.5 list-none">
                  <li>• 이전받는 자: Amazon Web Services, Inc.</li>
                  <li>• 이전 국가: 미국, 한국 (ap-northeast-2)</li>
                  <li>• 이전 항목: 계정 정보, 설문 데이터, 대화 기록</li>
                  <li>• 이전 목적: 서비스 데이터베이스 운영</li>
                  <li>• 이전 방법: 암호화 전송 (TLS)</li>
                  <li>• 보유 기간: 회원 탈퇴 시까지</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="6. 개인정보의 파기">
            <ul className="space-y-1 list-none">
              <li>• 파기 절차: 수집 목적 달성 후 내부 방침에 따라 즉시 파기</li>
              <li>• 파기 방법: 전자적 파일은 복구 불가능한 방법으로 삭제</li>
            </ul>
          </Section>

          <Section title="7. 정보주체의 권리">
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="mt-2 space-y-1 list-none">
              <li>• 개인정보 열람 요구</li>
              <li>• 개인정보 정정·삭제 요구</li>
              <li>• 개인정보 처리정지 요구</li>
              <li>• 회원 탈퇴</li>
            </ul>
          </Section>

          <Section title="8. 개인정보 보호책임자">
            <ul className="space-y-1 list-none">
              <li>• 서비스명: 피요(Piyo)</li>
              <li>• 운영사: Wellness Aging</li>
              <li>• 이메일: cs@wellnessaging.co.kr</li>
            </ul>
          </Section>

          <Section title="9. 만 14세 미만 아동">
            <p>
              서비스는 만 14세 미만 아동의 개인정보를 수집하지 않습니다. 만
              14세 미만임이 확인된 경우 수집된 정보를 즉시 파기합니다.
            </p>
          </Section>
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
