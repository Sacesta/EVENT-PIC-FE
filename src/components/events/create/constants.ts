// Event types configuration - using translation keys
export const EVENT_TYPES = [
  { value: 'street', labelKey: 'createEvent.eventTypes.street' },
  { value: 'nature', labelKey: 'createEvent.eventTypes.nature' },
  { value: 'birthday', labelKey: 'createEvent.eventTypes.birthday' },
  { value: 'party', labelKey: 'createEvent.eventTypes.party' },
  { value: 'wedding', labelKey: 'createEvent.eventTypes.wedding' },
  { value: 'other', labelKey: 'createEvent.eventTypes.other' }
];

// Popular locations - using translation keys
export const POPULAR_LOCATIONS = [
  { value: 'north', labelKey: 'createEvent.locations.north' },
  { value: 'south', labelKey: 'createEvent.locations.south' },
  { value: 'golan', labelKey: 'createEvent.locations.golan' },
  { value: 'telAviv', labelKey: 'createEvent.locations.telAviv' },
  { value: 'jerusalem', labelKey: 'createEvent.locations.jerusalem' },
  { value: 'haifa', labelKey: 'createEvent.locations.haifa' },
  { value: 'beerSheva', labelKey: 'createEvent.locations.beerSheva' },
  { value: 'gilboa', labelKey: 'createEvent.locations.gilboa' },
  { value: 'parkHayarkon', labelKey: 'createEvent.locations.parkHayarkon' }
];

// Time slots
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

// Currency options
export const CURRENCIES = [
  { value: 'USD', symbol: '$', label: 'USD ($)' },
  { value: 'EUR', symbol: '€', label: 'EUR (€)' },
  { value: 'ILS', symbol: '₪', label: 'ILS (₪)' }
];
