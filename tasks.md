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
- [x] Calculate the border segments a player needs in total based on length and start pos.
- [x] Calculate the segments for each player. The total segment length for each player at the start is calculateBorderLength, and next player's border segments begin next pixel after previous player's last border segment ends.
  - [x] The segments should be assigned to specific named players, so that we can refer to correct player colour and assign health loss to a player

### Game Area

- [ ] Fit canvas into game area.
- [ ] Start drawing border for next player where the previous player's border ended.
  - Remember the player's assigned color on each of their border segments.

## Project Setup

- [x] Install dependencies (Completed)
- [x] Configure Tailwind CSS (Low)
- [x] Set up Vitest configuration (Low)
- [x] Configure Redux store (Medium)
