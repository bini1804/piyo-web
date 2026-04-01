import type { HospitalBusinessTimesDto } from "@/types/hospital-detail";

type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type BusinessStatus = "open" | "closed" | "lunch" | "holiday";

export interface BusinessStatusInfo {
  status: BusinessStatus;
  message: string;
}

const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "일요일",
  1: "월요일",
  2: "화요일",
  3: "수요일",
  4: "목요일",
  5: "금요일",
  6: "토요일",
};

const DAY_NAMES_SHORT: Record<DayOfWeek, string> = {
  0: "일",
  1: "월",
  2: "화",
  3: "수",
  4: "목",
  5: "금",
  6: "토",
};

const DAY_PREFIXES: Record<DayOfWeek, string> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function findNextBusinessDay(
  businessTimes: HospitalBusinessTimesDto,
  startDay: DayOfWeek
): { day: DayOfWeek; openTime: string; daysAhead: number } | null {
  const days = Array.from(
    { length: 7 },
    (_, i) => ((startDay + i + 1) % 7) as DayOfWeek
  );

  for (const [index, day] of days.entries()) {
    const prefix = DAY_PREFIXES[day];
    const isClosedKey = `${prefix}IsClosed`;
    const openTimeKey = `${prefix}OpenTime`;

    const isClosed = businessTimes[isClosedKey];
    const openTime = businessTimes[openTimeKey] as string | undefined;

    if (!isClosed && openTime) {
      return {
        day,
        openTime,
        daysAhead: index + 1,
      };
    }
  }

  return null;
}

export function getBusinessStatus(
  businessTimes: HospitalBusinessTimesDto | undefined,
  now = new Date()
): BusinessStatusInfo {
  if (!businessTimes) {
    return {
      status: "closed",
      message: "진료 시간 정보가 없습니다.",
    };
  }

  const dayOfWeek = now.getDay() as DayOfWeek;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const prefix = DAY_PREFIXES[dayOfWeek];
  const dayName = DAY_NAMES[dayOfWeek];

  const isClosedKey = `${prefix}IsClosed`;
  if (businessTimes[isClosedKey]) {
    return {
      status: "holiday",
      message: `<strong>휴진</strong> 매주 ${dayName} 휴진`,
    };
  }

  const openTimeKey = `${prefix}OpenTime`;
  const closeTimeKey = `${prefix}CloseTime`;
  const openTime = businessTimes[openTimeKey] as string | undefined;
  const closeTime = businessTimes[closeTimeKey] as string | undefined;

  if (!openTime || !closeTime) {
    return {
      status: "closed",
      message: "진료 시간 정보가 없습니다.",
    };
  }

  const openMinutes = timeToMinutes(openTime);
  const closeMinutes = timeToMinutes(closeTime);

  const lunchStartTimeKey = `${prefix}LunchStartTime`;
  const lunchEndTimeKey = `${prefix}LunchEndTime`;
  const lunchStartTime = businessTimes[lunchStartTimeKey] as string | undefined;
  const lunchEndTime = businessTimes[lunchEndTimeKey] as string | undefined;

  if (lunchStartTime && lunchEndTime) {
    const lunchStartMinutes = timeToMinutes(lunchStartTime);
    const lunchEndMinutes = timeToMinutes(lunchEndTime);

    if (
      currentMinutes >= lunchStartMinutes &&
      currentMinutes < lunchEndMinutes
    ) {
      return {
        status: "lunch",
        message: `<strong>점심시간</strong> ${lunchStartTime} - ${lunchEndTime} 까지`,
      };
    }
  }

  if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
    return {
      status: "open",
      message: `<strong>진료중</strong> ${closeTime} 영업 종료`,
    };
  }

  if (currentMinutes >= closeMinutes) {
    const nextBusiness = findNextBusinessDay(businessTimes, dayOfWeek);

    if (!nextBusiness) {
      return {
        status: "closed",
        message: "<strong>진료종료</strong>",
      };
    }

    if (nextBusiness.daysAhead === 1) {
      return {
        status: "closed",
        message: `<strong>진료종료</strong> 내일 ${nextBusiness.openTime}에 진료 시작`,
      };
    }

    const nextDayName = DAY_NAMES[nextBusiness.day];
    return {
      status: "closed",
      message: `<strong>진료종료</strong> ${nextDayName} ${nextBusiness.openTime}에 진료 시작`,
    };
  }

  return {
    status: "closed",
    message: `<strong>진료종료</strong> ${openTime}에 진료 시작`,
  };
}

export function formatDaySchedule(
  day: DayOfWeek,
  businessTimes: HospitalBusinessTimesDto | undefined,
  now = new Date()
): { day: string; schedule: string; isToday: boolean; isClosed: boolean } {
  const dayName = DAY_NAMES_SHORT[day];
  const dayNameFull = DAY_NAMES[day];
  const prefix = DAY_PREFIXES[day];
  const isToday = now.getDay() === day;

  if (!businessTimes) {
    return { day: dayName, schedule: "-", isToday, isClosed: false };
  }

  const isClosedKey = `${prefix}IsClosed`;

  if (businessTimes[isClosedKey]) {
    return {
      day: dayName,
      schedule: `매주 ${dayNameFull} 휴진`,
      isToday,
      isClosed: true,
    };
  }

  const openTimeKey = `${prefix}OpenTime`;
  const closeTimeKey = `${prefix}CloseTime`;
  const openTime = businessTimes[openTimeKey] as string | undefined;
  const closeTime = businessTimes[closeTimeKey] as string | undefined;

  if (!openTime || !closeTime) {
    return { day: dayName, schedule: "-", isToday, isClosed: false };
  }

  return {
    day: dayName,
    schedule: `${openTime} - ${closeTime}`,
    isToday,
    isClosed: false,
  };
}

export function getAllDaySchedules(
  businessTimes: HospitalBusinessTimesDto | undefined,
  now = new Date()
) {
  return ([1, 2, 3, 4, 5, 6, 0] as DayOfWeek[]).map((day) =>
    formatDaySchedule(day, businessTimes, now)
  );
}
