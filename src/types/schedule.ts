
export interface ScheduleData {
  id?: string;
  year: number;
  month: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface SpecialScheduleData {
  id: string;
  specific_date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface TreatmentLimit {
  id: string;
  treatment_name: string;
  max_reservations_per_slot: number;
}

export interface TimeSlot {
  start: string;
  end: string;
}
