export const toKSTISOString = (date) => {
    const tzOffsetMs = 9 * 60 * 60 * 1000;
    const local = new Date(date.getTime() + tzOffsetMs);
    return local.toISOString().split('T')[0];
  };