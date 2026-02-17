
"use client";

export type UserEventData = {
  make_art: boolean;
  description: string;
  done: boolean;
  updated_at?: string;
  done_at?: string;
  is_custom?: boolean;
  custom_title?: string;
  custom_summary?: string;
};

export type CalendarStorage = {
  [date: string]: UserEventData[];
};

const STORAGE_KEY = "santa_fe_arts_calendar_2026";

export function getStoredData(): CalendarStorage {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : {};
}

export function saveDayData(date: string, events: UserEventData[]) {
  const current = getStoredData();
  current[date] = events;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function getAllUserEvents() {
  const data = getStoredData();
  return data;
}
