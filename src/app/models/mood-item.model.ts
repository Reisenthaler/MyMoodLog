export interface MoodItem {
  id: number;        // unique ID
  name: string;      // label
  active: boolean;   // toggle state
  isDefault: boolean; // true = one of the 4 default items
}