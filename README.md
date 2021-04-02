## Stay Hidden
Simple horror like game that features
- simple implementation of ray marching that helps in generating run time light/shadows
- bounding volume hierarchy that speeds up collision detection
- labirynth generator

## Tech stack
It's plane JS with HTML5 and CSS with some use of ES6 features.

Libraries:
- [Pixi.js](https://www.pixijs.com/) for the GPU based rendering
- [Howler.js](https://howlerjs.com/) that takes care of sounds

Forks:
- [Collisions](https://github.com/YesIDont/Collisions) that use BVH theorem

## How To
You can move the character with WSAD keys and rotate flash light with your mouse. The flashlight can be switched with F key and if you press Shift key the character will start sprinting. No monsters in the game yet.

## Demo
Current build is deployed here: [https://www.stayhidden.dysonspheregames.com/](https://www.stayhidden.dysonspheregames.com/)

## TO DO:
- [ ] encapsulate all flashlight logic within flashlight class
- [ ] encapsulate all player's logic within its own class
- [ ] create basic game entity class that will share common logick for player, monster, statics (e.g. lockers, doors) and other entities
- [ ] add inventory
- [ ] consider moving to React.js/TS
- [ ] create zippo lighter item
- [ ] turn global light on/off
    - [ ] switch for player to interact with
    - [ ] power plant that can be fueld to generate some electricity for lights for short time
    - [ ] fuel item
    - [ ] visuals
- [ ] monster
    - [ ] level exploration AI
    - [ ] random senses, e.g. random strength of each sense and random senses number?
    - [ ] visuals
    - [ ] hunger - the more hungry the monster gets, the more dangerous and fast it becomes
    - [ ] bio limbs / tentacles that shoot in movement direction that are pulling monster's body forward
    - [x] ~~add basic physic body that can interact with evnironment~~
    - [x] ~~make monster hurt player on overlap~~
- [ ] rewrite fps counter to work on the main canvas instead of its own
