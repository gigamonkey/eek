import { deck } from './learn.js';

const cards = $('#cards').querySelectorAll('div.card');

let current = null;
let state = new State(cards);

const next = () => {
  current = state.next();
  if (current === null) {
    $('#current').innerText = 'Done!';
  } else {
    $('#current').replaceChildren(current);
  }
  console.log(state.summary());
}

console.log(`Deck is ${state.deck.length} cards`);

next();

window.onkeydown = (e) => {
  if (current) {
    const back = current.querySelector('.back');
    if (getComputedStyle(back).display === 'none') {
      back.style.display = 'block';
    } else {
      if (e.code === 'ArrowLeft') {
        state.incorrect(current);
      } else if (e.code === 'ArrowRight') {
        state.correct(current);
      } else {
        return; // ignore key; don't change anything
      }
      back.style.display = 'none';
      next();
    }
  }
};
