# Logo-Bounce roulette

## Before starting the game

- User can add names to the list of participants.
  - The game assigns a color to each player.
  - A border section along the play area is added which corresponds to the player's colour.
    - At the beginning, all the players share the border circumference evenly.
- User can remove names from the list of participants.
  - Their border sections are freed and the remaining space is shared evenly between players.
- User has a couple of settings that they can change.
  - They can provide their own logo to use in the game.
    - The png file is sized according to max hieght or max width, whichever the image hits first.
  - The user can set how much variance in angle of each bounce has.
  - The user can set the health of each player.

## Gameplay

- The border sections assigned to each player begin to rotate counter-clockwise along the border of the game area.
- The logo is set into movement in random direction from the centre of the game area.
- When the logo hits the edge of the game area:
  - The player whose border the logo hits, loses one health.
  - The logo bounces in an angle. The variance of angle makes the angle not as predictable.
- If a player runs out of health, Their border section is removed.
  - The space their section took, is shared between the two players surrounding them.
    - This means each player no longer has equal size sections.
    - Share the fallen player's length with the two surrounding players.
- Last player remaining wins.

## Controls

- User can start the game.
- User can pause the game.
  - User can continue the game.
- User can reset the game to restore it to before starting state.

## UI

Ui is shared in two sections

### Left

- 2/3 of the screen is allocated for a 2:3 area where the game happens.

### Right

- A white box which has two tabs.
  1. Name input & list.
  2. Settings for using your own png, angle variance and player health.

### GameArea

- Game area is a 3:2 rectangle.
- Each player has a border section assigned to them in their color.
- Next to the border sections, outside the game area, floats a component which includes the Name of the player that border section is assigned to.
