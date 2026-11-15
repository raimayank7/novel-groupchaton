/* Infinity by GroupChatOn — pressure. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('units', 'pressure', {
  groups: [{ k: 'press', label: 'Pressure', units: 'PRESS' }], from: 'bar', to: 'psi', value: 1,
  note: 'Tyre pressure is usually in psi or bar; blood pressure in mmHg; weather in hPa (millibars).',
  test: [['press', 1, 'bar', 'psi', 14.5037738], ['press', 1, 'atm', 'mmhg', 760], ['press', 32, 'psi', 'bar', 2.20632], ['press', 1, 'kgcm', 'kpa', 98.0665]]
});
