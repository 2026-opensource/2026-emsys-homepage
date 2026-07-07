export const HIDE_INTRODUCE_LANDING_KEY = "hideIntroduceLanding";

export const shouldHideIntroduceLanding = () => {
  return localStorage.getItem(HIDE_INTRODUCE_LANDING_KEY) === "true";
};

export const setHideIntroduceLanding = (hideLanding) => {
  if (hideLanding) {
    localStorage.setItem(HIDE_INTRODUCE_LANDING_KEY, "true");
    return;
  }

  localStorage.removeItem(HIDE_INTRODUCE_LANDING_KEY);
};
