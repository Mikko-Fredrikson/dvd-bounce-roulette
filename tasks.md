# Task List

## [ ] Ui

- [x] Game-area
  - [x] Create a 2:3 container with canvas for the bouncing logo.
- [x] Container for name input and settings
  - [x] Implement tab navigation functionality (Low)
  - [x] Style the control panel with consistent theme (Low)

### Name-input

- [x] Create required slice for each player.
  - Players need: Name, Health, Color, sectionStart, sectionLength
  - [x] Implement player reducer (Medium)
  - [x] Create actions for adding/removing players (Low)
  - [x] Implement color assignment logic (Medium)

### Settings

- [x] Create settings slice for game configuration
  - [x] Define state shape (angleVariance, playerHealth, customLogo, logoSpeed) (Low)
  - [x] Implement reducers for updating settings (Low)
  - [x] Write unit tests for settings slice (Medium)
  - [x] Implement logo upload and preview (Medium)
  - [x] Add angle variance controls (Low)
    - [x] Connect slider in ControlPanel to dispatch update action (Low)
    - [x] Display current variance value in ControlPanel (Low)
  - [ ] Add player health controls (Low)
  - [x] Add logo speed controls (Low)
    - [x] Add slider to ControlPanel for logo speed (Low)
    - [x] Connect slider to dispatch update action for logo speed (Low)
    - [x] Display current speed value in ControlPanel (Low)

### Game Controls

- [x] Create game state slice (Medium)
  - [x] Implement start/pause/reset functionality (Medium)
    - [x] Adjust reset to restore player health and logo position instead of removing players (Low)
  - [ ] Add game loop with animation frame (High)

### Player border sections

- [x] Add utility function to calculate how long each players border should be (circumference / playercount)
- [x] Create a truct to store and refer the different lengths and properties of the gameArea's sides.
- [x] Calculate if a player's border segment is too long for the side it is on depending on starting location and side length.
- [x] Calculate the border segments a player needs in total based on length and start pos.
- [x] Calculate the segments for each player. The total segment length for each player at the start is calculateBorderLength, and next player's border segments begin next pixel after previous player's last border segment ends.
  - [x] The segments should be assigned to specific named players, so that we can refer to correct player colour and assign health loss to a player

### Game Area

- [x] Fit canvas into game area.
- [x] Start drawing border for next player where the previous player's border ended.
  - Remember the player's assigned color on each of their border segments.
- [x] Add player name boxes next to border segments.
  - [x] Create component for player name display (Low)
  - [x] Calculate mid-point of each player's primary segment (Medium)
  - [x] Position name boxes outside the game area next to players' border segments (Medium)
  - [x] Animate name boxes to rotate with border segments (Medium)
- [x] Transform border segments counterclockwise along the game area border.
- implement the logo animation.

  - [x] Implement an oval shape moving on the canvas, which bounces off of borders.

    - [x] Create a logo state slice for position, velocity, and appearance (Medium)
    - [x] Define logo animation properties (size, speed, default appearance) (Low)
    - [x] Draw logo centered in gameArea
    - [x] Animation loop
      - [x] Separate animation loop from animated border segments. (Now combined)
      - [x] use the animation loop for BOTH border segments and logo animation.
    - [x] Handle collision with gameArea borders.
      - [x] Define logo boundaries based on its current position and dimensions (e.g., top, bottom, left, right edges).
      - [x] Check if the logo's top edge hits or exceeds the top border of the game area.
      - [x] Check if the logo's bottom edge hits or exceeds the bottom border of the game area.
      - [x] Check if the logo's left edge hits or exceeds the left border of the game area.
      - [x] Check if the logo's right edge hits or exceeds the right border of the game area.
      - [x] If a collision with a horizontal border (top/bottom) is detected, reverse the vertical component of the logo's velocity.
      - [x] If a collision with a vertical border (left/right) is detected, reverse the horizontal component of the logo's velocity.
      - [x] Add angle variance logic upon collision based on settings (Medium)
      - [ ] Ensure collision detection accounts for potential high speeds (preventing the logo from passing through the border between frames).

  - [x] Handle logo collision with player border segments.

    - [x] Determine the exact point of collision on the game area border.
    - [x] Identify which player's border segment is at the collision point at the time of impact.
      - [x] Consider the current rotation of the border segments.
      - [x] Map the collision coordinates to the corresponding player segment.
    - [x] Dispatch an action to reduce the health of the identified player.
      - [x] Refer to the player's state using their assigned ID or name.
    - [ ] Check if the player's health has reached zero after the hit.
    - [x] If health is zero, trigger player elimination logic.
      - [x] Remove the player's border segment(s).
      - [x] Recalculate and redistribute the freed border space to adjacent players (refer to game rules in `game-document.md`).
      - [x] Update the player list/state.
    - [ ] Check for win conditions (e.g., only one player remaining).

  - [ ] Integrate with game mechanics.

  - [ ] When the shape hits a border, it sets an state for the border side (`utils/borderUtils/borderSides.ts`) and position touched.

- [ ] Visual Effects

  - [x] Change logo color to match the last hit player's color (Low)
  - [x] Add particle effects on collision (Medium)
    - [x] Particles should match the color of the hit player segment (Low) - Updated: Mix player and logo colors
  - [x] Add small impact visual effect at the collision point (Low) - Updated: Implemented as box-shadow pulse
  - [x] Add a subtle trail effect to the moving logo (Medium) # Task completed
  - [ ] Add screen shake on collision (Low)
  - [ ] Add border segment hit/elimination animations (Medium)
    - [ ] Glow/flash effect on hit (Low)
    - [ ] Fade/shatter/shrink animation on elimination (Medium)
  - [ ] Add dynamic background effects (Medium)
    - [ ] Subtle pulse on collision (Low)
    - [ ] Color shift on player elimination (Low)
  - [ ] Add winner announcement animation (Medium)

- [ ] Audio
  - [ ] Add sound effects for collisions (Low)
  - [ ] Add sound effect for player elimination (Low)
  - [ ] Add background music (Low)
  - [ ] Add sound effect for winner announcement (Low)

## Project Setup

- [x] Install dependencies (Completed)
- [x] Configure Tailwind CSS (Low)
- [x] Set up Vitest configuration (Low)
- [x] Configure Redux store (Medium)
