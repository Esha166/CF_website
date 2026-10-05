const PREFIX = "cf-submit:";

export function getSubmitCooldownKey(formName: string) {
  return `${PREFIX}${formName}`;
}

export function isWithinCooldown(formName: string, cooldownMs: number) {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(getSubmitCooldownKey(formName));
  if (!raw) return false;
  const lastSubmitted = Number(raw);
  if (Number.isNaN(lastSubmitted)) return false;
  return Date.now() - lastSubmitted < cooldownMs;
}

export function markSubmitted(formName: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getSubmitCooldownKey(formName), String(Date.now()));
}
