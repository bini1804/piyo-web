"use client";

import { useState } from "react";
import { Shield, Check } from "lucide-react";
import PiyoLogo from "@/components/ui/PiyoLogo";

interface ConsentModalProps {
  onConsent: (dataCollectionAgreed: boolean) => void;
}

function Checkbox({ checked, onChange, children, badge }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <label className="flex items-start gap-3 p-3 rounded-xl border border-piyo-border hover:bg-piyo-surfaceHover transition-colors cursor-pointer">
      <div className="flex-shrink-0 mt-0.5">
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${checked ? "bg-brand-400 border-brand-400" : "border-piyo-textTertiary"}`}>
          {checked && <Check size={12} strokeWidth={3} className="text-white" />}
        </div>
      </div>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div>
        <div className="flex items-center gap-1.5">{children}{badge}</div>
      </div>
    </label>
  );
}

export default function ConsentModal({ onConsent }: ConsentModalProps) {
  const [privacy, setPrivacy] = useState(false);
  const [data, setData] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-piyo-surface rounded-3xl shadow-modal max-w-md w-full p-8 animate-slide-up">
        <div className="flex flex-col items-center mb-6">
          <PiyoLogo size="md" />
          <h2 className="font-display text-lg font-semibold text-piyo-text mt-4 mb-1">피요를 시작하기 전에</h2>
          <p className="text-sm text-piyo-textSecondary text-center">원활한 서비스를 위해 아래 동의가 필요해요</p>
        </div>

        <div className="space-y-3 mb-6">
          <Checkbox checked={privacy} onChange={setPrivacy} badge={<span className="text-2xs text-rose-500 font-medium">필수</span>}>
            <span className="text-sm font-medium text-piyo-text">개인정보 처리방침 동의</span>
            <p className="text-xs text-piyo-textTertiary mt-0.5">서비스 이용을 위한 개인정보 수집·이용에 동의합니다.</p>
          </Checkbox>

          <Checkbox checked={data} onChange={setData} badge={<span className="text-2xs text-piyo-textTertiary font-medium">선택</span>}>
            <span className="text-sm font-medium text-piyo-text">서비스 개선 데이터 수집 동의</span>
            <p className="text-xs text-piyo-textTertiary mt-0.5">대화 내용을 익명화하여 서비스 개선에 활용합니다.</p>
          </Checkbox>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-piyo-surfaceHover mb-6">
          <Shield size={16} className="text-piyo-textTertiary flex-shrink-0" />
          <p className="text-xs text-piyo-textTertiary leading-snug">수집된 데이터는 암호화되어 안전하게 보관되며, AI 학습에 직접 사용되지 않습니다.</p>
        </div>

        <button onClick={() => onConsent(data)} disabled={!privacy} className={`piyo-btn-primary w-full text-base ${!privacy ? "opacity-40 cursor-not-allowed" : ""}`}>
          시작하기
        </button>
      </div>
    </div>
  );
}
