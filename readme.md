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








## 🚀 Deploying to GitHub Pages (Vite + Vue)

This project is deployed as a GitHub Pages **project site**:

https://cptmoo.github.io/space-wars/

### 1. Configure Vite base path

Edit `vite.config.js`:

```js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/space-wars/',
  plugins: [vue()],
})
2. Ensure dependencies

Make sure vue is installed:

npm install vue
3. Build locally (optional but recommended)
npm run build
npm run preview
4. Add GitHub Actions workflow

Create:

.github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v6

      - name: Setup Node
        uses: actions/setup-node@v6
        with:
          node-version: lts/*
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: ./dist

      - name: Deploy
        id: deployment
        uses: actions/deploy-pages@v4
5. Enable GitHub Pages

In the repo:

Settings → Pages → Source → GitHub Actions

Do not use Jekyll or Static HTML options.

6. Deploy
git add .
git commit -m "Deploy setup"
git push
7. Live site

After the workflow completes:

https://cptmoo.github.io/space-wars/
⚠️ Common issues
Blank page → missing base: '/space-wars/'
Build fails → vue not installed
Assets missing → incorrect base path
💡 Notes
dist/ is only a build output folder (not part of the URL)
GitHub Actions builds and deploys automatically on push to main