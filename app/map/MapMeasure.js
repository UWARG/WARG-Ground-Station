var MapMeasure = function (leaflet) {
  return leaflet.control.measure({
    primaryLengthUnit: 'meters',
    secondaryLengthUnit: 'kilometers',
    primaryAreaUnit: 'sqkilometers',
    secondaryAreaUnit: 'sqmeters',
    activeColor: '#ABE67E',
    completedColor: '#C8F2BE',
    units: {
      sqkilometers: {
        factor: 1e-6, // Required. Factor to apply when converting to this unit. Length in meters or area in sq meters will be multiplied by this factor.
        display: 'Sq. Kilometers', // Required. How to display in results, like.. "300 Meters (0.3 My New Unit)".
        decimals: 2 // Number of decimals to round results when using this unit. `0` is the default value if not specified.
      }
    }
  });
};

module.exports = MapMeasure;