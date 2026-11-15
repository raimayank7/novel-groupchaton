/* Infinity by GroupChatOn — energy. Designed & Developed by Nivesh Sahayak. See LICENSE. */
GCOTools.engine('units', 'energy', {
  groups: [{ k: 'energy', label: 'Energy', from: 'kwh', to: 'kcal', units: 'ENERGY' }, { k: 'power', label: 'Power', from: 'kw', to: 'hp', units: 'POWER' }],
  from: 'kwh', to: 'kcal', value: 1,
  test: [['energy', 1, 'kwh', 'kcal', 860.42065], ['energy', 1, 'kcal', 'kj', 4.184], ['energy', 1, 'btu', 'j', 1055.05585], ['power', 1, 'hp', 'w', 745.69987], ['power', 1, 'tr', 'kw', 3.5168528]]
});
