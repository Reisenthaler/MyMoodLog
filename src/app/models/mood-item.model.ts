export interface MoodItem {
  id: number;
  name: string;
  active: boolean;
  isDefault: boolean;
  scalePlans: { [key: number]: number | null }; 
  note?: string;
}