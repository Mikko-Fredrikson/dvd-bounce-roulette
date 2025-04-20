# GitHub Copilot Instructions for DVD Bounce Roulette

## Project Overview

This project is a web-based game that simulates the classic DVD screensaver bounce animation, but as a game where player names are eliminated when the bouncing DVD logo hits them.
The game is described in the `game-document.md` file

## Development guidelines

- **Important** Always develop every feature one task at a time
- **Important** Write unit tests for all components and utilities before implementing the feature.
- Use pnpm run test to run test. You can still define specifc file.
- Follow React best practices with TypeScript
- Use Redux Toolkit for state management
- Implement GSAP for animations
- Maintain component-based architecture

### Stack

- Package management with pnpm
- Vite react
- testing with vitest
- Tailwind-css for styling
- Canvas for the game area.
- Animate moving borders with gsap

### Styling Approach

- Follow responsive design principles
- Maintain a consistent color scheme

## Task Management

- **IMPORTANT**: Always check if a requested task is defined in the `tasks.md` file
- Every feature and part of feature is a task. For example both a component and an utulity function the component utilises are separate tasks.
- If implementing a feature, verify it exists in the task list before proceeding
- If a task doesn't exist but seems necessary, suggest adding it to the task list first
- Mark tasks as completed in `tasks.md` file when they're done.
- Follow the hierarchical task structure (main tasks and subtasks)
- When adding new functionality, create appropriate tasks in `tasks.md` file
- Include complexity estimates (Low, Medium, High)
- Organize subtasks logically

## Knowledge Preservation

### Lessons Learned

- **IMPORTANT**: Refer to the `.github/lessons-learned.md` file for known issues and their solutions
- Before implementing complex features, check if similar challenges have been documented
- After resolving difficult bugs or discovering optimal patterns, document them in the lessons-learned file
- Use the knowledge base to avoid repeating previous mistakes and to follow established best practices

## Code Quality Standards

- Follow ESLint and Prettier configurations
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components focused on a single responsibility
- Optimize performance for animation-heavy features
