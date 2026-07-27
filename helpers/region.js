const ORIENTE = 'oriente';
const OCCIDENTE = 'occidente';

// Debe mantenerse sincronizado con:
// atlantidascs-project/src/shared/helpers/helpRegion.js
const REGION_BY_STATE = {
  'Amazonas': ORIENTE,
  'Anzoátegui': ORIENTE,
  'Apure': OCCIDENTE,
  'Aragua': OCCIDENTE,
  'Barinas': OCCIDENTE,
  'Bolívar': ORIENTE,
  'Carabobo': OCCIDENTE,
  'Cojedes': OCCIDENTE,
  'Delta Amacuro': ORIENTE,
  'Distrito Capital': ORIENTE,
  'Falcón': OCCIDENTE,
  'Guárico': OCCIDENTE,
  'La Guaira': ORIENTE,
  'Lara': OCCIDENTE,
  'Mérida': OCCIDENTE,
  'Miranda': ORIENTE,
  'Monagas': ORIENTE,
  'Nueva Esparta': ORIENTE,
  'Portuguesa': OCCIDENTE,
  'Sucre': ORIENTE,
  'Táchira': OCCIDENTE,
  'Trujillo': OCCIDENTE,
  'Yaracuy': OCCIDENTE,
  'Zulia': OCCIDENTE,
};

const getRegionByState = (estado) => REGION_BY_STATE[estado];

const VALID_STATES = Object.keys(REGION_BY_STATE);

module.exports = {
  ORIENTE,
  OCCIDENTE,
  getRegionByState,
  VALID_STATES,
};
