export interface Athlete {
  id: number;
  name: string;
  dateOfBirth: string; // 'YYYY-MM-DD'
  sex: 'male' | 'female' | 'other';
  height: number; // cm
  weight: number; // kg
  shirtSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  shortSize: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  shoeSize: number; // EU
  notes?: string;
}