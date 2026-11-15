/* Infinity by GroupChatOn — unit-convert. Designed & Developed by Nivesh Sahayak. See LICENSE. */
(function () {
  var C = function (x) { return x; };
  GCOTools.engine('units', 'unit-convert', {
    groups: [
      { k: 'len', label: 'Length / distance', from: 'km', to: 'mi', units: [['mm', 'Millimetre (mm)', 0.001], ['cm', 'Centimetre (cm)', 0.01], ['m', 'Metre (m)', 1], ['km', 'Kilometre (km)', 1000],
        ['in', 'Inch (in)', 0.0254], ['ft', 'Foot (ft)', 0.3048], ['yd', 'Yard / gaj (yd)', 0.9144], ['mi', 'Mile (mi)', 1609.344], ['nmi', 'Nautical mile (nmi)', 1852],
        ['um', 'Micrometre (µm)', 1e-6], ['nm', 'Nanometre (nm)', 1e-9], ['fur', 'Furlong (fur)', 201.168], ['au', 'Astronomical unit (AU)', 1.495978707e11], ['ly', 'Light year (ly)', 9.4607304725808e15]] },
      { k: 'mass', label: 'Weight / mass', from: 'kg', to: 'lb', units: [['mg', 'Milligram (mg)', 1e-6], ['g', 'Gram (g)', 0.001], ['kg', 'Kilogram (kg)', 1], ['t', 'Tonne (t)', 1000], ['q', 'Quintal (q)', 100],
        ['oz', 'Ounce (oz)', 0.028349523125], ['lb', 'Pound (lb)', 0.45359237], ['st', 'Stone (st)', 6.35029318], ['ton', 'US ton (short ton)', 907.18474], ['lton', 'UK ton (long ton)', 1016.0469088],
        ['ct', 'Carat (ct)', 0.0002], ['tola', 'Tola', 0.0116638038], ['gr', 'Grain (gr)', 6.479891e-5]] },
      { k: 'vol', label: 'Volume / capacity', from: 'l', to: 'galus', units: [['ml', 'Millilitre (mL)', 0.001], ['l', 'Litre (L)', 1], ['m3', 'Cubic metre (m³)', 1000], ['cm3', 'Cubic centimetre (cm³)', 0.001],
        ['tsp', 'Teaspoon, US (tsp)', 0.00492892159375], ['tbsp', 'Tablespoon, US (tbsp)', 0.01478676478125], ['cup', 'Cup, US (cup)', 0.2365882365], ['flozus', 'Fluid ounce, US (fl oz)', 0.0295735295625],
        ['ptus', 'Pint, US (pt)', 0.473176473], ['qtus', 'Quart, US (qt)', 0.946352946], ['galus', 'Gallon, US (gal)', 3.785411784], ['flozuk', 'Fluid ounce, UK (UK fl oz)', 0.0284130625],
        ['ptuk', 'Pint, UK (UK pt)', 0.56826125], ['galuk', 'Gallon, UK (UK gal)', 4.54609], ['ft3', 'Cubic foot (ft³)', 28.316846592], ['in3', 'Cubic inch (in³)', 0.016387064], ['bbl', 'Oil barrel (bbl)', 158.987294928]] },
      { k: 'area', label: 'Area', from: 'm2', to: 'ft2', units: [['mm2', 'Square millimetre (mm²)', 1e-6], ['cm2', 'Square centimetre (cm²)', 1e-4], ['m2', 'Square metre (m²)', 1], ['ha', 'Hectare (ha)', 1e4],
        ['km2', 'Square kilometre (km²)', 1e6], ['in2', 'Square inch (in²)', 0.00064516], ['ft2', 'Square foot (sq ft)', 0.09290304], ['yd2', 'Square yard (sq yd)', 0.83612736], ['ac', 'Acre (ac)', 4046.8564224],
        ['mi2', 'Square mile (mi²)', 2589988.110336]] },
      { k: 'speed', label: 'Speed', from: 'kmh', to: 'mph', units: [['ms', 'Metres per second (m/s)', 1], ['kmh', 'Kilometres per hour (km/h)', 1 / 3.6], ['mph', 'Miles per hour (mph)', 0.44704],
        ['kn', 'Knot (kn)', 1852 / 3600], ['fts', 'Feet per second (ft/s)', 0.3048], ['mach', 'Mach, at sea level (Mach)', 340.29], ['c', 'Speed of light (c)', 299792458]] },
      { k: 'time', label: 'Time', from: 'h', to: 'min', units: [['ns', 'Nanosecond (ns)', 1e-9], ['us', 'Microsecond (µs)', 1e-6], ['ms', 'Millisecond (ms)', 0.001], ['s', 'Second (s)', 1], ['min', 'Minute (min)', 60],
        ['h', 'Hour (h)', 3600], ['d', 'Day (d)', 86400], ['wk', 'Week (wk)', 604800], ['mo', 'Month, average (mo)', 2629746], ['yr', 'Year, average (yr)', 31556952], ['dec', 'Decade', 315569520], ['cen', 'Century', 3155695200]] },
      { k: 'temp', label: 'Temperature', from: 'c', to: 'f', units: [['c', 'Celsius (°C)', C, C], ['f', 'Fahrenheit (°F)', function (f) { return (f - 32) * 5 / 9; }, function (c) { return c * 9 / 5 + 32; }],
        ['k', 'Kelvin (K)', function (k) { return k - 273.15; }, function (c) { return c + 273.15; }], ['r', 'Rankine (°R)', function (r) { return (r - 491.67) * 5 / 9; }, function (c) { return (c + 273.15) * 9 / 5; }]] },
      { k: 'press', label: 'Pressure', from: 'bar', to: 'psi', units: 'PRESS' },
      { k: 'energy', label: 'Energy', from: 'kwh', to: 'kcal', units: 'ENERGY' },
      { k: 'power', label: 'Power', from: 'kw', to: 'hp', units: 'POWER' },
      { k: 'angle', label: 'Angle', from: 'deg', to: 'rad', units: 'ANGLE' },
      { k: 'fuel', label: 'Fuel economy', from: 'mpgus', to: 'l100', units: 'FUEL' }],
    value: 1, from: 'km', to: 'mi',
    test: [['len', 1, 'mi', 'km', 1.609344], ['mass', 1, 'kg', 'lb', 2.20462262], ['vol', 1, 'galus', 'l', 3.785411784], ['area', 1, 'ac', 'm2', 4046.8564224], ['speed', 100, 'kmh', 'mph', 62.1371192],
      ['temp', 100, 'f', 'c', 37.7777778], ['temp', -40, 'c', 'f', -40], ['press', 1, 'atm', 'psi', 14.6959488], ['energy', 1, 'kwh', 'kcal', 860.42065], ['angle', 1, 'rad', 'deg', 57.2957795], ['fuel', 30, 'mpgus', 'l100', 7.84048611]]
  });
})();
