"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useChatStore } from "@/stores";
import { cn, groupSessionsByDay } from "@/lib/utils";
import type { SkinType } from "@/types";
import { Plus, User } from "lucide-react";

const SKIN_LABEL: Record<SkinType, string> = {
  oily: "지성",
  dry: "건성",
  combination: "복합성",
  sensitive: "민감성",
  normal: "중성",
};

interface SidebarProps {
  isLoggedIn: boolean;
  /** 표시용: 별명 우선, 없으면 userName */
  nickname?: string;
  userName?: string;
  userAvatarUrl?: string;
  skinType?: SkinType;
  concerns?: string[];
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onLoginClick: () => void;
  onSurveyClick: () => void;
  onProfileClick?: () => void;
}

export default function ChatSidebar({
  isLoggedIn,
  nickname,
  userName,
  userAvatarUrl,
  skinType,
  concerns = [],
  onNewChat,
  onSelectSession,
  onLoginClick,
  onSurveyClick,
  onProfileClick,
}: SidebarProps) {
  const memberLabel = nickname?.trim() || userName?.trim() || "회원";
  const avatarLetter = (nickname?.trim() || userName || "U").slice(0, 1);
  const router = useRouter();
  const {
    sessions,
    currentSessionId,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    loadSession,
    updateSessionTitle,
    deleteSession,
  } = useChatStore();

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, [setSidebarOpen]);

  const handleSelect = (id: string) => {
    loadSession(id);
    onSelectSession(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen, setSidebarOpen]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  // 편집 input 자동 포커스 + 전체 선택
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const startEdit = (id: string, currentTitle: string) => {
    setOpenMenuId(null);
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) {
      updateSessionTitle(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    deleteSession(id);
    showToast("대화가 삭제됐어요");
  };

  // 중복 제거 후 그룹핑
  const uniqueSessions = sessions.filter(
    (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
  );
  const groups = groupSessionsByDay(uniqueSessions);

  return (
    <>
      {/* 모바일 오버레이 — 외부 클릭 시 사이드바 닫기 */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="사이드바 닫기"
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "z-40 flex h-dvh w-[260px] shrink-0 flex-col border-r border-[#efefef] bg-[#f7f7f5] transition-[transform,width,opacity] duration-300 ease-out",
          "max-md:fixed max-md:left-0 max-md:top-0 max-md:shadow-[0_4px_12px_rgba(0,0,0,0.08)]",
          isSidebarOpen
            ? "max-md:translate-x-0"
            : "max-md:pointer-events-none max-md:-translate-x-full",
          !isSidebarOpen &&
            "md:pointer-events-none md:w-0 md:min-w-0 md:overflow-hidden md:border-0 md:opacity-0"
        )}
      >
        {/* 사이드바 헤더 — 피요 로고 클릭 시 홈으로 */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#efefef] px-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex min-w-0 items-center gap-2 rounded-lg transition-colors hover:bg-[#f0f0ee] px-1 py-0.5"
            aria-label="홈으로"
          >
            <Image
              src="/images/piyo-default.png"
              alt="피요"
              width={28}
              height={28}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
            />
            <span className="truncate text-sm font-semibold text-[#1a1a1a]">
              피요
            </span>
          </button>
          <button
            type="button"
            onClick={toggleSidebar}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-[#6b6b6b] transition-colors hover:bg-[#f0f0ee]"
          >
            접기
          </button>
        </div>

        <div className="shrink-0 p-3">
          <button
            type="button"
            onClick={onNewChat}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-[1.5px] border-[#efefef] py-2.5 text-sm font-medium text-[#1a1a1a] transition-colors hover:border-[#f4cb4b] hover:bg-[#fdf6dc]"
          >
            <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
            새 대화
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          {uniqueSessions.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm leading-relaxed text-[#6b6b6b]">
              아직 대화 기록이
              <br />
              없어요
            </p>
          ) : (
            <div className="space-y-4">
              {groups.map((g) => (
                <div key={g.label}>
                  <p className="mb-1.5 px-2 text-[11px] font-medium uppercase tracking-wide text-[#b0b0b0]">
                    {g.label}
                  </p>
                  <ul className="space-y-0.5">
                    {g.sessions.map((s) => (
                      <li key={s.id} className="relative group">
                        {editingId === s.id ? (
                          // 이름 변경 모드
                          <div className="flex items-center gap-1 rounded-lg bg-[#fdf6dc] px-3 py-2">
                            <input
                              ref={editInputRef}
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveEdit(s.id);
                                if (e.key === "Escape") cancelEdit();
                              }}
                              onBlur={() => saveEdit(s.id)}
                              className="min-w-0 flex-1 bg-transparent text-sm text-[#1a1a1a] outline-none"
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelect(s.id)}
                            className={cn(
                              "w-full rounded-lg px-3 py-2 text-left text-sm text-[#1a1a1a] transition-colors",
                              currentSessionId === s.id
                                ? "bg-[#fdf6dc]"
                                : "bg-transparent hover:bg-[#f0f0ee]"
                            )}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="block min-w-0 truncate">
                                · {s.title}
                              </span>
                              {/* ··· 버튼: PC hover / 모바일 항상 */}
                              <span
                                role="button"
                                tabIndex={0}
                                aria-label="메뉴"
                                onClick={(e) => toggleMenu(e, s.id)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ")
                                    toggleMenu(e as unknown as React.MouseEvent, s.id);
                                }}
                                className={cn(
                                  "shrink-0 rounded p-1 text-[#b0b0b0] transition-colors hover:bg-gray-100 hover:text-gray-500",
                                  "md:opacity-0 md:group-hover:opacity-100"
                                )}
                              >
                                ···
                              </span>
                            </div>
                          </button>
                        )}

                        {/* 드롭다운 메뉴 */}
                        {openMenuId === s.id && (
                          <div
                            onMouseDown={(e) => e.stopPropagation()}
                            className="absolute right-0 top-full z-50 mt-0.5 min-w-[120px] rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(s.id, s.title);
                              }}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                            >
                              ✏️ 이름 변경
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, s.id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-gray-50"
                            >
                              🗑️ 삭제
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </nav>

        <div className="shrink-0 border-t border-[#efefef] p-3">
          {!isLoggedIn ? (
            <div className="space-y-3 rounded-2xl bg-[#fdf6dc] p-3">
              <div className="flex items-start gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                  <User
                    className="h-4 w-4 text-[#6b6b6b]"
                    strokeWidth={2}
                    aria-hidden
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#1a1a1a]">
                    비로그인
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-[#6b6b6b]">
                    로그인하면 대화가 저장돼요
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLoginClick}
                className="w-full rounded-lg bg-[#f4cb4b] py-2.5 text-sm font-semibold text-[#1a1a1a] transition-opacity hover:opacity-95"
              >
                로그인하기
              </button>
              <button
                type="button"
                onClick={onSurveyClick}
                className="w-full py-1 text-center text-xs font-medium text-[#6b6b6b] transition-colors hover:text-[#1a1a1a]"
              >
                피부 설문하기 →
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onProfileClick}
              className="w-full rounded-2xl border border-[#efefef] p-3 text-left transition-colors hover:bg-[#f0f0ee]"
            >
              <div className="flex items-center gap-2">
                {userAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userAvatarUrl}
                    alt=""
                    width={32}
                    height={32}
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdf6dc] text-xs font-semibold text-[#1a1a1a]">
                    {avatarLetter}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#1a1a1a]">
                    {memberLabel}
                  </p>
                  {skinType && (
                    <span className="mt-1 inline-block rounded-md bg-[#fdf6dc] px-2 py-0.5 text-[11px] font-medium text-[#1a1a1a]">
                      {SKIN_LABEL[skinType]}
                    </span>
                  )}
                  {concerns.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {concerns.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="rounded bg-[#f0f0ee] px-1.5 py-0.5 text-[11px] text-[#6b6b6b]"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </button>
          )}
        </div>
      </aside>

      {/* 토스트 알림 */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-gray-800 px-4 py-2 text-sm text-white">
          {toast}
        </div>
      )}
    </>
  );
}
