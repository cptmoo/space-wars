const map = {
  id: 'map06',
  name: 'Wheel',

  dimensions: {
    width: 100,
    height: 140,
  },

  rules: {
    maxShips: 20,         // [5, 10, 20, 30, 40, 50, 60, 75, 100, 125, 150, 200]
    maxLevel: 8,          // [3, 4, 5, 6, 7, 8, 10, 12]
    shipTimeFactor: 0.5,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    upgradeTimeFactor: 2.0, // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    flightTimeFactor: 1,  // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    capitalBonus: 1.0,    // [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 7.5, 10.0]
    battleRate: 2,        //[1.0, 2.0, 3.0, 4.0, 5.0, 7.5, 10.0, 12.5, 15.0, 20.0, 25.0]
  },

  winCondition: {
    type: 'capital-loss',  // ['elimination', 'capital-loss']
    options: {},
  },

planets: [
  // centre
  { id: 'O', label: 'O', x: 50, y: 70, initialOwner: 0, initialShips: 14, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} },

  // outer ring clockwise from 12 o'clock
  { id: 'A', label: 'A', x: 50, y: 14, initialOwner: 2, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} }, // 12
  { id: 'B', label: 'B', x: 67, y: 19, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 1
  { id: 'C', label: 'C', x: 79, y: 43, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 2
  { id: 'D', label: 'D', x: 84, y: 70, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 3
  { id: 'E', label: 'E', x: 79, y: 97, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 4
  { id: 'F', label: 'F', x: 67, y: 121, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 5
  { id: 'G', label: 'G', x: 50, y: 126, initialOwner: 1, initialShips: 5, initialLevel: 0, initialMode: 'B', specialType: 'capital', overrides: {} }, // 6
  { id: 'H', label: 'H', x: 33, y: 121, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 7
  { id: 'I', label: 'I', x: 21, y: 97, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 8
  { id: 'J', label: 'J', x: 16, y: 70, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 9
  { id: 'K', label: 'K', x: 21, y: 43, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 10
  { id: 'L', label: 'L', x: 33, y: 19, initialOwner: 0, initialShips: 8, initialLevel: 0, initialMode: 'B', specialType: null, overrides: {} }, // 11
],

  edges: [
    // outer ring
    { from: 'A', to: 'B', flightTime: 0.9 },
    { from: 'B', to: 'C', flightTime: 0.9 },
    { from: 'C', to: 'D', flightTime: 0.9 },
    { from: 'D', to: 'E', flightTime: 0.9 },
    { from: 'E', to: 'F', flightTime: 0.9 },
    { from: 'F', to: 'G', flightTime: 0.9 },
    { from: 'G', to: 'H', flightTime: 0.9 },
    { from: 'H', to: 'I', flightTime: 0.9 },
    { from: 'I', to: 'J', flightTime: 0.9 },
    { from: 'J', to: 'K', flightTime: 0.9 },
    { from: 'K', to: 'L', flightTime: 0.9 },
    { from: 'L', to: 'A', flightTime: 0.9 },

    // spokes to centre at 1, 3, 5, 7, 9, 11 o'clock only
    { from: 'B', to: 'O', flightTime: 1.0 },
    { from: 'D', to: 'O', flightTime: 1.0 },
    { from: 'F', to: 'O', flightTime: 1.0 },
    { from: 'H', to: 'O', flightTime: 1.0 },
    { from: 'J', to: 'O', flightTime: 1.0 },
    { from: 'L', to: 'O', flightTime: 1.0 },
  ],
}

export default map