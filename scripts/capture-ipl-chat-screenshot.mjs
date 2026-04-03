import { chromium } from "playwright";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(
  new URL("../ipl-laser-toning-chat-screenshot.png", import.meta.url)
);
const q = "IPL이랑 레이저토닝 중에 뭐가 나을까요";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 800, height: 900 },
});
await page.goto("http://127.0.0.1:3000/", {
  waitUntil: "domcontentloaded",
  timeout: 60_000,
});
const input = page.locator("textarea.chat-input");
await input.waitFor({ state: "visible", timeout: 30_000 });
await input.click();
await input.clear();
// 한 글자씩 입력해야 React onChange가 반응하는 환경이 있음
await input.pressSequentially(q, { delay: 5 });

const respWait = page.waitForResponse(
  (r) => r.url().includes("/api/chat") && r.request().method() === "POST",
  { timeout: 120_000 }
);
await page.getByRole("button", { name: "보내기" }).click();
const res = await respWait;
if (!res.ok()) {
  console.error("chat API status", res.status());
}

// 로딩 인디케이터(점 3개 옆) 제거 대기
await page
  .locator('img[alt="piyo"]')
  .waitFor({ state: "detached", timeout: 120_000 })
  .catch(async () => {
    await page.waitForTimeout(2000);
  });

// 타자 효과: prose 안 깜빡 커서 span 제거까지
await page.waitForFunction(
  () => {
    const prose = document.querySelector(".prose");
    if (!prose) return false;
    const text = prose.innerText?.trim() ?? "";
    const blinkInside = prose.querySelector("span[style*='blink']");
    return text.length > 40 && !blinkInside;
  },
  { timeout: 120_000 }
);

await page.evaluate(() => {
  window.scrollTo(0, 0);
  document.querySelector("main .overflow-y-auto")?.scrollTo(0, 0);
});

await page.waitForTimeout(1500);

await page.screenshot({ path: OUT, fullPage: false });
await browser.close();
console.log("saved", OUT);
