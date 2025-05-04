// Calcular días restantes entre fechas
export const getDaysRemaining = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
};

// Validar si una fecha es hoy
export const isToday = (date) => {
  const today = new Date();
  const compareDate = new Date(date);
  
  return today.getDate() === compareDate.getDate() &&
         today.getMonth() === compareDate.getMonth() &&
         today.getFullYear() === compareDate.getFullYear();
};

// Validar si una fecha es en los próximos N días
export const isInNextDays = (date, days) => {
  const future = new Date();
  future.setDate(future.getDate() + days);
  const compareDate = new Date(date);
  
  return compareDate <= future;
};