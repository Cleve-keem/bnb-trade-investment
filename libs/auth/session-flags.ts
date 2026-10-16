let manualLogout = false;

export const markManualLogout = () => {
  manualLogout = true;
};

export const consumeManualLogout = () => {
  const value = manualLogout;
  manualLogout = false;
  return value;
};
