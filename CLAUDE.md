# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an open-road racing game with two implementations:
- **index.html** + **game.js**: Phaser 3 version (2D racing game)
- **index2.html**: Three.js version (3D racing game with inline JavaScript)

## Development Commands

This is a static HTML/JavaScript project that runs directly in the browser. No build process or package manager is required.

To run the game:
- Open `index.html` in a web browser for the Phaser 3 version
- Open `index2.html` in a web browser for the Three.js version

## Architecture

### Phaser 3 Version (index.html + game.js)
- Single scene game using Phaser 3 framework loaded from CDN
- `RoadScene` class handles all game logic
- Procedurally generated textures (no external assets)
- Physics-based collision detection
- Lane-based movement system with 3 lanes

### Three.js Version (index2.html)
- Self-contained 3D racing game using Three.js
- All code embedded in index2.html as an IIFE
- Canvas-based road texture generation
- Box3 collision detection
- Same 3-lane gameplay as Phaser version but in 3D

## Key Game Mechanics

Both versions share core mechanics:
- 3-lane highway racing
- Traffic avoidance
- Checkpoint collection for score bonuses
- Nitro boost system with cooldown
- Progressive difficulty (speed increases over time)
- Distance-based scoring

Controls:
- Arrow keys or A/D for lane changes
- Shift for nitro boost
- R to restart after crash