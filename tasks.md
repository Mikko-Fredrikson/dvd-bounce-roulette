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

- [ ] Create settings slice for game configuration
  - [ ] Implement logo upload and preview (Medium)
  - [ ] Add angle variance controls (Low)
  - [ ] Add player health controls (Low)

### Game Controls

- [ ] Create game state slice (Medium)
  - [ ] Implement start/pause/reset functionality (Medium)
  - [ ] Add game loop with animation frame (High)

### Player border sections

- [x] Add utility function to calculate how long each players border should be (circumference / playercount)
- [x] Create a truct to store and refer the different lengths and properties of the gameArea's sides.
- [x] Calculate if a player's border segment is too long for the side it is on depending on starting location and side length.
- [ ] Calculate the border segments a player needs in total based on length and start pos.
- A loop for drawing player's corner
- [ ] Draw player's section along the edge clockwise
- [ ] Start a new section for the same player starting from the corner the previous one ended.
- [ ] Start drawing border for next player where the previous player's border ended.

## Project Setup

- [x] Install dependencies (Completed)
- [x] Configure Tailwind CSS (Low)
- [x] Set up Vitest configuration (Low)
- [x] Configure Redux store (Medium)
