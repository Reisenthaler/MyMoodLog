export interface MoodLogEntry {
  id: number; // unique ID (timestamp)
  date: string; // ISO string
  notificationId: string | null; // notification that triggered the log, or null
  selections: { [id: number]: number }; // moodId → intensity
  comment?: string; // user’s optional note
}