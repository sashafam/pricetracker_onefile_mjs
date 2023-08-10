import('./fitplus.mjs').then(fitplus => {
    return import('./fitplus_tg.mjs');
  }).then(fitplus_tg => {
    return import('./mercado.mjs');
  }).then(mercado => {
    return import('./mercado_tg.mjs');
  }).then(mercado_tg => {
    return import('./miproteina.mjs');
  }).then(miproteina => {
    return import('./miproteina_tg.mjs');
  }).then(miproteina_tg => {
    return import('./nutricore.js');
  }).then(nutricore => {
    return import('./nutricore_tg.mjs');
  }).then(nutricore_tg => {
    return import('./suplementoscolombia.js');
  }).then(suplementoscolombia => {
    return import('./suplementoscolombia_tg.mjs');
  }).then(suplementoscolombia_tg => {
    return import('./zonafit.js');
  }).then(zonafit => {
    return import('./zonafit_tg.mjs');
  }).then(zonafit_tg => {
    // Здесь вы можете продолжить выполнять свой код,
    // который использует загруженные модули
    
  }).catch(error => {
    console.error('Error loading modules:', error);
  });
  