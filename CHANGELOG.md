## [2.1.0](https://github.com/Mearman/pi-perms/compare/v2.0.0...v2.1.0) (2026-05-12)

### Features

* simplify extension to use walk-up loader with with/without/up ([9743849](https://github.com/Mearman/pi-perms/commit/97438491963a9e2b3a72ba70c526800d7dcf0211))

### Bug Fixes

* **ci:** ignore @mistralai/mistralai malware advisory ([5b542a5](https://github.com/Mearman/pi-perms/commit/5b542a5e67892b774e743eb70261b479293749fd))

## [2.0.0](https://github.com/Mearman/pi-perms/compare/v1.2.3...v2.0.0) (2026-05-10)

### ⚠ BREAKING CHANGES

* requires agent-perms@^4 which uses unified
rules[] instead of permissions.allow/deny/ask

### Features

* update to agent-perms@4 (unified rules) ([f5ef785](https://github.com/Mearman/pi-perms/commit/f5ef785bbf6825e4e9358555895daddbcc60567e))

## [1.2.3](https://github.com/Mearman/pi-perms/compare/v1.2.2...v1.2.3) (2026-05-10)

### Chores

* add LICENSE file, remove license section from README ([24ecf6f](https://github.com/Mearman/pi-perms/commit/24ecf6f5683e1ea7eeb8b66a4e7bcddd51ae4210))

## [1.2.2](https://github.com/Mearman/pi-perms/compare/v1.2.1...v1.2.2) (2026-05-10)

### Chores

* add pre-commit, commit-msg, and pre-push husky hooks ([a67d12b](https://github.com/Mearman/pi-perms/commit/a67d12ba8c6a4e70793b02d457d0d64045bf2a5a))

## [1.2.1](https://github.com/Mearman/pi-perms/compare/v1.2.0...v1.2.1) (2026-05-10)

### Documentation

* add npm version, license, and CI badges ([9372dc4](https://github.com/Mearman/pi-perms/commit/9372dc4b04143aee1291108d4961addccc7e967f))
* add README — policy file, rule syntax, source structure ([db3955f](https://github.com/Mearman/pi-perms/commit/db3955f0bfc0c848217ed9d6873321e4273a510e))

## [1.2.0](https://github.com/Mearman/pi-perms/compare/v1.1.1...v1.2.0) (2026-05-10)

### Features

* e2e tests for pi-perms extension ([1e2f51b](https://github.com/Mearman/pi-perms/commit/1e2f51b5a62400e75fa50ca3bc5eb1a899a2ff5a))

### Chores

* update to agent-perms@3 (Claude Code rule syntax) ([986c25c](https://github.com/Mearman/pi-perms/commit/986c25ccea2293feb91ac9f238bc22541f4819b0))

## [1.1.1](https://github.com/Mearman/pi-perms/compare/v1.1.0...v1.1.1) (2026-05-10)

### Refactoring

* use agent-perms@2 wildcard subpath imports ([2a422a9](https://github.com/Mearman/pi-perms/commit/2a422a9730a84f3f4180d9cb0e1a8083eed3e28b))

## [1.1.0](https://github.com/Mearman/pi-perms/compare/v1.0.2...v1.1.0) (2026-05-10)

### Features

* add test coverage, export extractInput ([e17907b](https://github.com/Mearman/pi-perms/commit/e17907b5d987497ce64035feed2cbc18547d01ba))

### Refactoring

* rename index.ts to extension.ts ([567adc8](https://github.com/Mearman/pi-perms/commit/567adc80d4102352ea67f2b87ba672b3ef052174))

## [1.0.2](https://github.com/Mearman/pi-perms/compare/v1.0.1...v1.0.2) (2026-05-10)

### Refactoring

* delegate evaluate + loader to agent-perms@1.1.0 ([6edbf2a](https://github.com/Mearman/pi-perms/commit/6edbf2afe40457afc9dbdee3ab2645727bd48756))

## [1.0.1](https://github.com/Mearman/pi-perms/compare/v1.0.0...v1.0.1) (2026-05-10)

### Chores

* bump version to 1.0.1 ([f072d2c](https://github.com/Mearman/pi-perms/commit/f072d2cd1c8708747c73d9c342aa85cd5c8ba141))

## 1.0.0 (2026-05-10)

### Features

* pi-perms Pi CLI extension ([474ed7e](https://github.com/Mearman/pi-perms/commit/474ed7ec6a97bfcaed0fef94c86cc2068914fe2d))

### Bug Fixes

* **ci:** approve @google/genai build script ([b0b63bc](https://github.com/Mearman/pi-perms/commit/b0b63bcefa138daea33b88b8fbf1345ef2470629))
* **ci:** approve all transitive build scripts ([4fce353](https://github.com/Mearman/pi-perms/commit/4fce35340166fd5f68c703feb0879c6347a85049))
* **ci:** pre-approve build scripts in pnpm-workspace.yaml ([f89c069](https://github.com/Mearman/pi-perms/commit/f89c0698eb4594bf97639ff19871e53b91ceff9a))
* **ci:** separate OIDC npm alias and GitHub Packages jobs ([767a1fc](https://github.com/Mearman/pi-perms/commit/767a1fc0d34069f15882c5fc39b868165a28c48a))
* sync extension factory, format ([a3a93aa](https://github.com/Mearman/pi-perms/commit/a3a93aa29bcb7ec1806bd23d8024ca129ed332bc))
