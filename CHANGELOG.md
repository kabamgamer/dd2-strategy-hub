# Changelog

## [Unreleased](https://github.com/kabamgamer/dd2-strategy-hub/tree/HEAD)

* Added search function to all select boxes (defenses, shards, mods)
* Added additional collapse in defense to collapse user details only

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.2.1...HEAD)



## [v1.2.1](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.2.1) (2023-09-07)

* Fixed an issue in motherly instinct calculations

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.2.0...v1.2.1)



## [v1.2.0](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.2.0) (2023-08-31)

* Added DU calculator to defense setups
* Added defense range calculator
* Added defense health calculator
* Fixed a bug in the UI causing collapse to snap instead of transition

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.8...v1.2.0)



## [v1.1.8](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.8) (2023-08-29)

* Hide shards/mods if they are incompatible with the defense
* Added defense rate stat
* Added option to rename setups
* Fixed bug where toggle collapse in a setup would also toggle collapse in defenses section

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.7...v1.1.8)



## [v1.1.7](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.7) (2023-08-28)

* Added defense count input for configuring more of the same defense in a setup
* Added support for motherly instinct mods
* Added support for unique mods
* Fixed contrast for icon colors in dark mode

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.6...v1.1.7)



## [v1.1.6](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.6) (2023-08-24)

* Added share button to make sharing setups easier
* Implemented short urls for sharing setups
* Fixed an issue where in some cases setups wouldn't recalculate

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.5...v1.1.6)



## [v1.1.5](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.5) (2023-08-23)

* Fixed an issue where newly created defenses wouldn't automatically recalculate after data changes

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.4...v1.1.5)



## [v1.1.4](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.4) (2023-08-23)

* Added upgrade scalars for BA/BB
* Implemented vampiric empowerment upgrade formula

### Bug fixes
* Don't buff critical damage on BB/BA with Talisman
* Don't impact boost aura/buff beam with talisman
* Don't apply call to arms buff to BA/BB
* Don't apply eruption buff to BA/BB
* Fixed minor flaw in buff beam with vampiric calculation
* Fixed an issue in boosted power calculations
* Fixed an issue involving boosted beam shard

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.3...v1.1.4)



## [v1.1.3](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.3) (2023-08-21)

* Added Lavamancer's Eruption buff
* Added missing buff improvement shards

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.2...v1.1.3)



## [v1.1.2](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.2) (2023-08-19)

* Fixed dark mode in footer
* Added setup damage modifiers
* Added godly stat on relic

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.1...v1.1.2)



## [v1.1.1](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.1) (2023-07-17)

* Added chaos 10 to chaos table
* Persist defense collapse
* Added import/export feature
* Removed custom diverse stacks and only support diverse mods in setups
* Added tooltip DPS
* Added dark mode
* Fixed some issues in defense calculations

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.1.0...v1.1.1)



## [v1.1.0](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.1.0) (2023-07-13)

* Implemented user data store, responsible for managing all user data
* Added proper calculations for buff beams and boost aura
* Added defense setups
* Implemented destructive pylon multiplier
* Added support for diverse mods

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.0.2...v1.1.0)



## [v1.0.2](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.0.2) (2023-07-05)

* Added link to webapp in README.md by @kabamgamer in https://github.com/kabamgamer/dd2-strategy-hub/pull/3
* Fixed some responsive styling in ancient power points section
* Fetch defense stats from google app now as well

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.0.1...v1.0.2)



## [v1.0.1](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.0.1) (2023-06-29)

* Added a basic footer with a link to this repo
* Upgraded Bootstrap from 5.2 to 5.3
* Added Github continuous integration for auto linting and type check on PR
* Fixed a bug in additive modifiers in mods and shards
* Added error handler in case data couldn't be fetched from remote source

[Full Changelog](https://github.com/kabamgamer/dd2-strategy-hub/compare/v1.0.0...v1.0.1)



## [v1.0.0](https://github.com/kabamgamer/dd2-strategy-hub/tree/v1.0.0) (2023-06-29)

Initial release of the webapp
