# Poker Hand Evaluator (Texas Hold'em)

TypeScript implementation of a Texas Hold'em hand evaluator and comparator.

Rules reference:
- [Wikipedia - List of poker hands](https://en.wikipedia.org/wiki/List_of_poker_hands)

## Goal
- Select the best 5-card hand out of 7 cards.
- Compare hand values (category + tie-break).
- Compare multiple players (single winner or split pot).
- Return a deterministic `chosen5` consistent with tie-break rules.

## Stack
- TypeScript
- Vitest

## Installation
```bash
npm install
```

## Commands
```bash
npm test
npm run test:watch
npm run typecheck
npm run lint
npm run test:coverage
npm run verify
```

## Card Format
- Allowed ranks: `2 3 4 5 6 7 8 9 T J Q K A`
- Allowed suits: `C D H S`
- Example: `AS`, `TD`, `7H`

## Supported Categories (highest to lowest)
1. `STRAIGHT_FLUSH`
2. `FOUR_OF_A_KIND`
3. `FULL_HOUSE`
4. `FLUSH`
5. `STRAIGHT`
6. `THREE_OF_A_KIND`
7. `TWO_PAIR`
8. `ONE_PAIR`
9. `HIGH_CARD`

## Implemented Tie-Break Rules
- `STRAIGHT_FLUSH` / `STRAIGHT`: highest card in the straight (`A-2-3-4-5` is 5-high).
- `FOUR_OF_A_KIND`: quad rank, then kicker.
- `FULL_HOUSE`: trip rank, then pair rank.
- `FLUSH`: all 5 cards in descending rank order.
- `THREE_OF_A_KIND`: trip rank, then 2 kickers descending.
- `TWO_PAIR`: high pair, low pair, kicker.
- `ONE_PAIR`: pair rank, then 3 kickers descending.
- `HIGH_CARD`: all 5 cards descending.

## Deterministic `chosen5` Ordering
`chosen5` is always returned in canonical order:
- `STRAIGHT` / `STRAIGHT_FLUSH`: high -> low (wheel: `5,4,3,2,A`).
- `FOUR_OF_A_KIND`: quads first, kicker last.
- `FULL_HOUSE`: trip cards first, pair cards second.
- `THREE_OF_A_KIND`: trips first, then kickers.
- `TWO_PAIR`: high pair, low pair, kicker.
- `ONE_PAIR`: pair first, then kickers.
- `FLUSH` / `HIGH_CARD`: descending ranks.

## Input Validation Strategy
The project uses explicit duplicate-card rejection:
- duplicate in `evaluate7`
- duplicate between board and hole cards
- duplicate across multiple players

Error format:
- `Duplicate card: <notation>`

## Public API
```ts
// src/card.ts
parseCard(notation: string): Card

// src/hand-evaluator.ts
evaluate5(cards: Card[]): HandEvaluation
evaluate7(cards: Card[]): BestOfSevenEvaluation
assertNoDuplicateCards(cards: Card[]): void

// src/hand-comparator.ts
compareHandValues(left: HandEvaluation, right: HandEvaluation): number

// src/holdem.ts
evaluateHoldemHand(board: Card[], hole: Card[]): BestOfSevenEvaluation
determineWinners(board: Card[], playersHoles: Card[][]): WinnersResult
```

`compareHandValues` returns:
- `> 0` if left hand is stronger
- `< 0` if right hand is stronger
- `0` if tied

`WinnersResult`:
- `winnerIndexes: number[]`
- `playerResults: BestOfSevenEvaluation[]`
- `splitPot: boolean`

## Out of Scope
- betting rules (blinds, antes, side pots, stacks)
- jokers / wild cards
- suit-based tie-breaking

## TDD Approach
The project was built in short TDD cycles:
1. `RED`: write a failing test
2. `GREEN`: implement minimal code to pass
3. `REFACTOR`: clean internals with behavior unchanged

Current test suite covers:
- all hand categories
- per-category tie-break behavior
- best-of-7 selection
- board plays (0/1/2 hole cards)
- multi-player winners and split pots
- deterministic `chosen5` ordering
- duplicate input validation
- integration tests for subject examples A-E

## Exam Deliverables
- `students.txt` at repository root
