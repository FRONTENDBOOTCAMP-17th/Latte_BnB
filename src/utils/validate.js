export function isValidUsername(value) {
  return /^[a-z0-9_]{4,20}$/.test(value);
}

export function isValidPassword(value) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(value);
}

export function isValidName(value) {
  return /^(?=.*\S).{1,50}$/.test(value);
}

export function isValidPhone(value) {
  return /^\d{10,11}$/.test(value);
}
