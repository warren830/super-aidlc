# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [4.1.0] - 2026-04-11

### Added
- Built-in browser automation (Playwright) for QA testing
- Browse integration tests with graceful Chrome skip
- Plan deviation prevention for agents

### Changed
- Agent line limit bumped to 270

### Fixed
- Browse uses ariaSnapshot() instead of deprecated accessibility.snapshot()
- Browse closes browser after each command (stateless mode)

## [4.0.0]

### Added
- Compound knowledge system (solutions/, janitor, compound-refresh)
- Parallel research agents (4 researchers simultaneously)
- Brainstorm phase for high-ambiguity tasks
- Three-strategy subagent dispatch (Inline/Serial/Parallel)
- 6 standalone skills under super-aidlc: namespace
- Cross-project knowledge sharing (~/.aidlc/global-solutions/)
- Session metrics tracking

## [2.0.0]

### Added
- Initial structured release with 23 improvements
