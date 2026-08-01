/**
 * Helper to compute instantaneous (0 delay) opening status based on device time and attraction schedule.
 */
export function getOpeningStatus(place) {
  if (!place) return { isOpen: true, text: 'Aberto' };

  const now = new Date();
  const currentHour = now.getHours();

  let openHour = 8;
  let closeHour = 18;
  let is24h = false;

  const title = (place.title || '').toLowerCase();
  const cat = (place.category || '').toLowerCase();

  if (/sampa sky|sky deck/.test(title)) { openHour = 9; closeHour = 18; }
  else if (/masp|pinacoteca|catavento|museu/.test(title + ' ' + cat)) { openHour = 10; closeHour = 18; }
  else if (/solazer|wet|thermas|park|aquático|aquatico/.test(title + ' ' + cat)) { openHour = 9; closeHour = 17; }
  else if (/praça|praca|parque dom pedro|parque ibirapuera|ladeira|avenida|rua|orla|prainha/.test(title + ' ' + cat)) { is24h = true; }

  if (is24h) {
    return { isOpen: true, text: 'Aberto 24h' };
  }

  if (currentHour >= openHour && currentHour < closeHour) {
    return { isOpen: true, text: `Aberto · Fecha ${closeHour}h` };
  } else {
    return { isOpen: false, text: `Fechado · Abre ${openHour}h` };
  }
}
