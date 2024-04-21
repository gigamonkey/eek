import { $, $$ } from './dom.js';
import { shuffled } from './random.js';

/*

  Cards are put into piles ordered by capacity. They all start in the zeroth
  pile. They are moved from pile to pile, always taking from the rightmost
  (largest capacity) pile where the pile to its right has room for another card.
  When the card is answered correctly it is moved to the next pile. When it is
  answered incorrectly it is moved back to the nearest pile to the left that has
  room for it. Most of the time that will be the zeroth pile which is special in
  that it can always accept a card. But toward the end of the deck, when all
  cards have been answered correctly multiple times we don't want to put one
  card all the way back to the beginning and have to ask just that one card
  repeatedly to move it back up so we only move it back part way.

 */

/*
 * A pile of cards that can hold a certain number of cards.
 */
class Pile {
  constructor(size, previous) {
    this.size = size;
    this.cards = [];
    this.previous = previous;
    previous.next = this;
    this.next = null;
  }

  isEmpty() {
    return this.cards.length === 0;
  }

  isFull() {
    return this.cards.length == this.size;
  }

  nextCard() {
    console.log(`Getting card from pile of size ${this.size}`);
    if (this.isEmpty()) {
      throw new Error(`Trying to get card from empty pile of size ${this.size}.`);
    }

    if (this.next !== null) {
      return this.cards.pop();
    } else {
      // The last pile has no next and therefore we never take a card from it
      return null;
    }
  }

  add(card) {
    card.pile = this;
    this.cards.unshift(card);
  }
}

class ZeroPile {
  constructor(cards) {
    this.unasked = [...cards];
    this.unasked.forEach(c => c.pile = this);
    this.wrong = [];
  }

  isEmpty() {
    return this.unasked.length === 0 && this.wrong.length === 0;
  }

  isFull() {
    return false;
  }

  nextCard() {
    // Possibly should mix in some unasked questions even when there are wrong
    // answers. Otherwise early on


    if (this.wrong.length > 0) {
      console.log(`Getting card from wrong list`);
      return this.wrong.pop();
    } else if (this.unasked.length > 0) {
      console.log(`Getting card from unasked list`);
      return this.unasked.pop();
    } else {
      throw new Error("Trying to get card from empty zero pile.");
    }
  }

  add(card) {
    this.wrong.unshift(card);
  }
}


/*
 * The overall state of where we are in the quiz. Manages a deck of cards which
 * can be basically any object.
 */
class State {

  constructor(cards, pileSizes) {
    this.deck = shuffled(cards);
    this.deck.forEach(c => c.asked = 0);
    this.done = [];
    this.zero = new ZeroPile(this.deck);
    let previous = this.zero;
    pileSizes.forEach(s => {
      previous = new Pile(s, previous);
    });
    this.last = new Pile(this.deck.length, previous);
  }

  /*
   * Get the next card to present. If all the cards are in the last pile. then
   * we're done and this will return null.
   */
  nextCard() {
    let p = this.zero;
    while (p !== this.last) {
      if (!p.isEmpty() && !p.next.isFull()) {
        break;
      }
      p = p.next;
    }
    return p.nextCard();
  }

  /*
   * Correct cards move to the next pile.
   */
  correct(card) {
    card.pile.next.add(card);
  }

  /*
   * Incorrect cards move back to the previous non full pile or to the zero pile
   * if that's where they came from.
   */
  incorrect(card) {
    let p = card.pile;
    while (p !== this.zero) {
      p = p.previous;
      if (!p.isFull()) {
        break;
      }
    }
    p.add(card);
  }
}

export { State };
