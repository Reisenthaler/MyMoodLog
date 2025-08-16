export interface MoodItem {
  id: number;
  name: string;
  active: boolean;
  isDefault: boolean;
  scalePlans: { [key: number]: number | null }; 
  // key = scale value (1–10), value = crisisPlanId or null
}