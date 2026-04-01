/**
 * RDS `banner_images` 등에서 오는 미디어 주소를 브라우저에서 바로 쓸 수 있는 URL로 정리.
 * - 앱·피요 API·웹 모두 동일 RDS / 동일 S3 객체를 가리키는 전제.
 * - DB에 이미 `https://…amazonaws.com/…` 형태로 들어 있으면 그대로 사용.
 * - `//host/…` 는 https 로 고정.
 * - `/path` 또는 `path` 만 있는 경우 `NEXT_PUBLIC_RDS_MEDIA_BASE_URL` (S3/CloudFront 베이스)를 앞에 붙임.
 */
export function resolveRdsMediaUrl(
  raw: string | undefined | null
): string {
  const s = (raw ?? "").trim();
  if (!s) return "";
  if (s.startsWith("//")) return `https:${s}`;
  if (/^https?:\/\//i.test(s)) return s;

  const base = (
    process.env.NEXT_PUBLIC_RDS_MEDIA_BASE_URL ??
    process.env.NEXT_PUBLIC_MEDIA_BASE_URL ??
    ""
  ).replace(/\/+$/, "");
  if (!base) return s;
  if (s.startsWith("/")) return `${base}${s}`;
  return `${base}/${s}`;
}
