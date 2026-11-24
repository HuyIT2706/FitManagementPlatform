export interface FoodComponent {
  name: string;
  defaultGrams: number;
  calPer100: number;
  proPer100: number;
  carbPer100: number;
  fatPer100: number;
}

export interface DemoDish {
  id: string;
  name: string;
  tag: string;
  image: string;
  description: string;
  components: FoodComponent[];
}

export interface VoiceToken {
  raw: string;
  parsed: string;
  cal: number;
  p: string;
  c: string;
  f: string;
}

export interface VoiceSample {
  spoken: string;
  tokens: VoiceToken[];
  totalCal: number;
  totalP: number;
  totalC: number;
  totalF: number;
}

export interface Testimonial {
  name: string;
  role: string;
  avatar: string;
  rating: number;
  quote: string;
  tag: string;
}

export interface FaqItem {
  q: string;
  a: string;
}
