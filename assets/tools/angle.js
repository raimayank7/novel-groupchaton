/* Infinity by GroupChatOn — angle. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('units', 'angle', {
  groups: [{ k: 'angle', label: 'Angle', units: 'ANGLE' }], from: 'deg', to: 'rad', value: 90,
  test: [['angle', 180, 'deg', 'rad', 3.14159265], ['angle', 1, 'turn', 'deg', 360], ['angle', 100, 'grad', 'deg', 90], ['angle', 1, 'deg', 'arcmin', 60]]
});
