# Poker Hand Evaluator (Texas Hold'em) - TypeScript + Vitest

## Goal
Evaluate Texas Hold'em hands with:
- best 5-card selection out of 7 cards
- category detection and tie-break values
- multi-player winner detection with split-pot support
- deterministic `chosen5` ordering

Reference rules:
- [Wikipedia - List of poker hands](https://en.wikipedia.org/wiki/List_of_poker_hands)

## Tech Stack
- TypeScript
- Vitest

## Scripts
- `npm test`: run tests once
- `npm run test:watch`: watch mode
- `npm run typecheck`: TypeScript type-checking

## Supported Hand Categories (high to low)
1. `STRAIGHT_FLUSH`
2. `FOUR_OF_A_KIND`
3. `FULL_HOUSE`
4. `FLUSH`
5. `STRAIGHT`
6. `THREE_OF_A_KIND`
7. `TWO_PAIR`
8. `ONE_PAIR`
9. `HIGH_CARD`

## Tie-Break Rules Implemented
- `STRAIGHT_FLUSH`, `STRAIGHT`: compare highest straight card (wheel `A-2-3-4-5` is `5-high`)
- `FOUR_OF_A_KIND`: quad rank, then kicker
- `FULL_HOUSE`: trip rank, then pair rank
- `FLUSH`: compare all 5 cards in descending rank
- `THREE_OF_A_KIND`: trip rank, then two kickers descending
- `TWO_PAIR`: high pair, low pair, kicker
- `ONE_PAIR`: pair rank, then three kickers descending
- `HIGH_CARD`: five cards descending

## `chosen5` Deterministic Ordering
Returned `chosen5` is always exactly 5 cards and follows a deterministic category-based order:
- `STRAIGHT` / `STRAIGHT_FLUSH`: high -> low (wheel as `5,4,3,2,A`)
- `FOUR_OF_A_KIND`: quads first, kicker last
- `FULL_HOUSE`: trip cards first, pair cards second
- `THREE_OF_A_KIND`: trips first, then kickers descending
- `TWO_PAIR`: high pair, low pair, kicker
- `ONE_PAIR`: pair first, then kickers descending
- `FLUSH` / `HIGH_CARD`: descending ranks

## Input Validation Strategy / Assumptions
This project **rejects duplicate cards** with explicit errors:
- duplicate in `evaluate7(...)`
- duplicate between board and hole cards in Hold'em
- duplicate across multiple players in winner calculation

Error format:
- `Duplicate card: <notation>`

## Public API

### Card parsing
From `src/card.ts`:
- `parseCard(notation: string): Card`

Accepted rank chars: `2..9,T,J,Q,K,A`  
Accepted suits: `C,D,H,S`

### 5-card and 7-card evaluation
From `src/hand-evaluator.ts`:
- `evaluate5(cards: Card[]): HandEvaluation`
- `evaluate7(cards: Card[]): BestOfSevenEvaluation`

`HandEvaluation`:
- `category: HandCategory`
- `tiebreak: number[]`

`BestOfSevenEvaluation`:
- `category`
- `tiebreak`
- `chosen5: Card[]`

### Hand value comparison
From `src/hand-comparator.ts`:
- `compareHandValues(left: HandEvaluation, right: HandEvaluation): number`

Returns:
- `> 0` if `left` is stronger
- `< 0` if `right` is stronger
- `0` if equal

### Hold'em helpers
From `src/holdem.ts`:
- `evaluateHoldemHand(board: Card[], hole: Card[]): BestOfSevenEvaluation`
- `determineWinners(board: Card[], playersHoles: Card[][]): WinnersResult`

`WinnersResult`:
- `winnerIndexes: number[]`
- `playerResults: BestOfSevenEvaluation[]`
- `splitPot: boolean`

## TDD Approach Used
Development followed strict incremental TDD cycles:
1. write a failing test (`RED`)
2. add minimal code to pass (`GREEN`)
3. refactor with tests green (`REFACTOR`)

Coverage progression included:
- all hand categories
- tie-break rules per category
- best-of-7 selection and board plays
- deterministic `chosen5`
- winner and split-pot detection
- duplicate-input validation
- integration tests for subject examples A-E
