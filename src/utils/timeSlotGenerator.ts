
export const generateTimeSlots = (startHour: number = 9, endHour: number = 19, intervalMinutes: number = 30) => {
  const timeSlots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endHour = minute === 30 ? hour + 1 : hour;
      const endMinute = minute === 30 ? 0 : 30;
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      timeSlots.push({ start: startTime, end: endTime });
    }
  }
  
  return timeSlots;
};
