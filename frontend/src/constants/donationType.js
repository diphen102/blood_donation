export const DONATION_TYPE_LABELS = {
  WHOLE_BLOOD: "Toàn phần",
  PLATELET: "Tiểu cầu",
  PLASMA: "Huyết tương",
};

export const DONATION_TYPE_OPTIONS = Object.entries(DONATION_TYPE_LABELS).map(([value, label]) => ({ value, label }));

// Số ngày chờ tối thiểu trước khi hiến lại - giá trị tham khảo, không phải tư vấn y khoa chính thức.
export const DONATION_WAITING_DAYS = {
  WHOLE_BLOOD: 84,
  PLATELET: 14,
  PLASMA: 14,
};

export const DONATION_DEFAULT_VOLUME = {
  WHOLE_BLOOD: 350,
  PLATELET: 250,
  PLASMA: 300,
};

export function computeNextEligibleDate(donationDate, donationType) {
  const d = new Date(donationDate);
  d.setDate(d.getDate() + (DONATION_WAITING_DAYS[donationType] ?? DONATION_WAITING_DAYS.WHOLE_BLOOD));
  return d;
}
