import { Suspense } from "react";
import { fetchHospitalDetail } from "@/lib/api/hospital";
import HospitalDetail, {
  HospitalDetailSkeleton,
} from "@/components/detail/HospitalDetail";

export default function HospitalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ beautyServiceId?: string }>;
}) {
  return (
    <Suspense fallback={<HospitalDetailSkeleton />}>
      <HospitalPageBody params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function HospitalPageBody({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ beautyServiceId?: string }>;
}) {
  const { id: rawId } = await params;
  const sp = await searchParams;
  const id = Number.parseInt(rawId, 10);
  const beautyRaw = sp.beautyServiceId;
  const beautyServiceId =
    beautyRaw != null && beautyRaw !== ""
      ? Number.parseInt(beautyRaw, 10)
      : undefined;

  if (!Number.isFinite(id) || id <= 0) {
    throw new Error("유효하지 않은 병원 ID입니다.");
  }

  const hospital = await fetchHospitalDetail(
    id,
    Number.isFinite(beautyServiceId) ? beautyServiceId : undefined
  );
  if (!hospital.name?.trim()) {
    const notFound = new Error("병원 정보를 찾을 수 없습니다.");
    (notFound as Error & { code?: string }).code = "NOT_FOUND";
    throw notFound;
  }
  return <HospitalDetail data={hospital} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  if (!Number.isFinite(id) || id <= 0) {
    return { title: "피요" };
  }
  try {
    const hospital = await fetchHospitalDetail(id);
    const name = hospital.name?.trim();
    return { title: name ? `${name} | 피요` : "병원 상세 | 피요" };
  } catch {
    return { title: "병원 상세 | 피요" };
  }
}
