```
src/
  main.js
  App.vue
  style.css

  components/
    GameBoard.vue
    PlayerConsole.vue
    MenuButton.vue

  game/
    maps/
      starterMap.js
    state.js
    rules.js
    engine.js
    selectors.js
    useGame.js
```

## Root

### `main.js`
Bootstraps the Vue app. Mounts `App.vue` and does no game logic.

### `App.vue`
Top-level layout and composition layer.

- Wires together UI components (`GameBoard`, `PlayerConsole`, `MenuButton`)
- Connects to the game via `useGame()`
- Contains minimal logic (mostly layout + passing props/events)

### `style.css`
Global styling for the app.

- Variables (colours, spacing, etc.)
- Shared layout rules
- No game logic


## Components (UI Layer)

### `components/GameBoard.vue`
Visual representation of the map.

- Renders planets, edges, fleets
- Handles user interactions on the board (e.g. selecting destinations)
- Purely presentational (no game rules)

### `components/PlayerConsole.vue`
Player control panel.

- Displays player stats and available actions
- Shows planet buttons and B/U controls
- Emits user actions (select, build, upgrade)

### `components/MenuButton.vue`
Hamburger menu and overlay.

- Toggles menu/help
- Emits high-level actions (new game, restart, help)
- No game logic


## Game Layer

### Maps

#### `game/maps/starterMap.js`
Static map definition.

- Planet positions
- Links between planets
- No dynamic state


### Core Game Logic

#### `game/state.js`
Creates and defines game state.

- Constants (e.g. max ships, max level)
- Factory functions for planets and match state
- Initial game setup

#### `game/rules.js`
Pure game rules and calculations.

- Valid move checks
- Planet connectivity
- Ship/send limits
- Build/upgrade rates
- No mutation of state

#### `game/engine.js`
State mutation and simulation.

- Applies player actions (send fleet, change mode)
- Advances the game (tick/update loop)
- Resolves battles and arrivals
- Updates economy and fleets

#### `game/selectors.js`
Derived data for the UI.

- Player stats
- Planet button states
- Any “computed” game info needed by components
- Keeps UI simple and free of game logic


## Vue Bridge

### `game/useGame.js`
Connects the game engine to Vue.

- Holds reactive state (`planetStates`, `fleets`, etc.)
- Runs the game loop (`requestAnimationFrame`)
- Exposes actions for UI (send fleet, set mode, reset)
- Combines engine + selectors into a clean interface for `App.vue`