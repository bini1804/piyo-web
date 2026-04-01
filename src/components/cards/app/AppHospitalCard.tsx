"use client";

import Image from "next/image";
import { MapPin, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppTag } from "./AppTag";

/** 앱 `features/hospital/ui/hospital-card.tsx` HospitalCardData 동일 */
export interface AppHospitalCardData {
  id: number;
  name: string;
  thumbnail?: string;
  isSpecialist?: boolean;
  rating: number;
  reviewCount: number;
  treatments?: string[];
  location: string;
  distance: string;
  businessHours: string;
}

interface AppHospitalCardProps {
  hospital: AppHospitalCardData;
  variant?: "default" | "compact";
  onClick?: (hospitalId: number) => void;
  isFirst?: boolean;
}

export function AppHospitalCard({
  hospital,
  variant = "default",
  onClick,
  isFirst = false,
}: AppHospitalCardProps) {
  const handleClick = () => {
    onClick?.(hospital.id);
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "flex w-full gap-[6px] rounded-lg border bg-white px-4 py-2.5 text-left transition-colors hover:bg-gray-50",
          isFirst ? "" : "border-gray-100"
        )}
        style={
          isFirst
            ? { borderColor: "var(--brand-dark)" }
            : undefined
        }
      >
        <div className="relative size-[70px] shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
          {hospital.thumbnail ? (
            <Image
              src={hospital.thumbnail}
              alt={hospital.name}
              fill
              className="object-cover"
              sizes="70px"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-gray-50" />
          )}
        </div>

        <div className="flex min-w-0 grow flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="line-clamp-2 min-w-0 flex-1 text-sm font-medium text-neutral-700">
              {hospital.name}
            </h4>
            {hospital.rating > 0 && (
              <div className="flex shrink-0 items-center gap-1">
                <Star
                  className="size-4 shrink-0 fill-[#FFCC02] text-[#FFCC02]"
                  aria-hidden
                />
                <span className="text-sm font-semibold text-neutral-700">
                  {hospital.rating.toFixed(1)}
                </span>
                <span className="text-sm font-normal text-neutral-400">
                  {hospital.reviewCount}
                </span>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0 text-neutral-500" aria-hidden />
              <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
                <span className="shrink-0 text-xs text-neutral-500">
                  {hospital.location}
                </span>
                {hospital.distance ? (
                  <>
                    <div className="h-2 w-px shrink-0 bg-neutral-300" />
                    <span className="min-w-0 truncate text-xs text-neutral-500">
                      {hospital.distance}
                    </span>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex min-w-0 items-center gap-1">
              <Clock className="size-3 shrink-0 text-neutral-500" aria-hidden />
              <span className="truncate text-xs text-neutral-500">
                평일 {hospital.businessHours}
              </span>
            </div>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex gap-3 rounded-lg border border-gray-100 p-3 text-left transition-colors hover:bg-gray-50"
    >
      <div className="relative size-[90px] shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {hospital.thumbnail ? (
          <Image
            src={hospital.thumbnail}
            alt={hospital.name}
            fill
            className="object-cover"
            sizes="90px"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gray-50" />
        )}
      </div>

      <div className="flex grow flex-col gap-1.5 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-start gap-1">
            <h4 className="line-clamp-2 text-sm font-semibold text-neutral-900">
              {hospital.name}
            </h4>
            {hospital.isSpecialist ? (
              <div className="shrink-0">
                <AppTag variant="specialist">전문의</AppTag>
              </div>
            ) : null}
          </div>
          {hospital.rating > 0 && (
            <div className="flex shrink-0 items-center gap-1">
              <Star
                className="size-4 shrink-0 fill-[#FFCC02] text-[#FFCC02]"
                aria-hidden
              />
              <span className="text-sm font-semibold text-neutral-700">
                {hospital.rating}
              </span>
              <span className="text-sm font-normal text-neutral-400">
                {hospital.reviewCount}
              </span>
            </div>
          )}
        </div>

        {hospital.treatments && hospital.treatments.length > 0 && (
          <div className="flex gap-1 overflow-hidden">
            <div className="flex min-w-0 gap-1 overflow-hidden">
              {hospital.treatments.slice(0, 3).map((treatment, index) => (
                <AppTag key={index} variant="default" className="shrink-0">
                  {treatment}
                </AppTag>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-0.5">
          <div className="flex min-w-0 items-start gap-1">
            <MapPin
              className="mt-0.5 size-3 shrink-0 text-neutral-500"
              aria-hidden
            />
            <div className="flex min-w-0 items-center gap-1.5 overflow-hidden">
              <span className="shrink-0 text-xs text-neutral-500">
                {hospital.location}
              </span>
              {hospital.distance ? (
                <>
                  <div className="h-2 w-px shrink-0 bg-neutral-300" />
                  <span className="min-w-0 truncate text-xs text-neutral-500">
                    {hospital.distance}
                  </span>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-3 shrink-0 text-neutral-500" aria-hidden />
            <span className="text-xs text-neutral-500">
              평일 {hospital.businessHours}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
