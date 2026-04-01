/**
 * 피지/시술 질문 1회 전송 후 마크다운 렌더·스크린샷 (수동 체크리스트 대응)
 */
import { test, expect } from "@playwright/test";
import path from "path";

test("피지 시술 추천 — 마크다운 렌더 및 스크린샷", async ({ page }) => {
  await page.goto("/");
  const q = "피지가 많이 나와서 고민이야 시술 추천해줘";
  const ta = page.locator("textarea").first();
  await ta.fill(q);
  const sendBtn = page.getByRole("button", { name: "보내기" });
  await expect(sendBtn).toBeEnabled();
  const responsePromise = page.waitForResponse(
    (r) => r.url().includes("/api/chat") && r.request().method() === "POST",
    { timeout: 120_000 }
  );
  await sendBtn.click();
  const res = await responsePromise;
  expect(res.ok(), `/api/chat HTTP ${res.status()}`).toBeTruthy();

  const prose = page.locator(".prose").last();
  await expect(prose).toBeVisible({ timeout: 120_000 });

  await page.waitForFunction(
    () => {
      const nodes = document.querySelectorAll(".prose");
      const last = nodes[nodes.length - 1];
      if (!last) return false;
      const cursors = last.querySelectorAll('span[style*="blink"]');
      return cursors.length === 0 && last.textContent != null && last.textContent.trim().length > 30;
    },
    { timeout: 120_000 }
  );

  const bodyText = await prose.innerText();
  expect(bodyText, "undefined 문자열 노출 금지").not.toContain("undefined");
  expect(bodyText, "파서 미처리 ### 금지").not.toMatch(/#{1,3}[^\n]/);

  const h3시술 = prose.locator("h3").filter({ hasText: /시술/ });
  await expect(h3시술.first()).toBeVisible();

  const shot = path.join(process.cwd(), "markdown-verify-screenshot.png");
  await page.screenshot({ path: shot, fullPage: true });
  console.log("스크린샷 저장:", shot);
});
