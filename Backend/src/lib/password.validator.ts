export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: /[A-Z]/,
  requireLowercase: /[a-z]/,
  requireSpecial: /[@&$!#%^*?~`\-_+=<>]/,
};

export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!password || password.length < PASSWORD_RULES.minLength) {
    errors.push("Minimum 8 characters");
  }
  if (!PASSWORD_RULES.requireUppercase.test(password)) {
    errors.push("At least 1 uppercase character (A, B, C...)");
  }
  if (!PASSWORD_RULES.requireLowercase.test(password)) {
    errors.push("At least 1 lowercase character (a, b, c...)");
  }
  if (!PASSWORD_RULES.requireSpecial.test(password)) {
    errors.push("At least 1 special character (@, &, $...)");
  }

  return { valid: errors.length === 0, errors };
}