import { byId, $, $$ } from './dom.js'
import { shuffled } from './random.js';
import { State } from './learn2.js';

/*
Sunny Yellow: #FFD700
Electric Blue: #007BFF
Tangerine: #F28500
Hot Pink: #FF69B4
Lime Green: #32CD32
*/

const questionColors = [
  '#ffd700',
  '#f28500',
  '#ff69b4',
  '#32cd32',
];

const colors  = [
  '#7F7EFF',
  '#A390E4',
  '#C69DD2',
  '#CC8B8C',
  '#C68866',
];

const doc = byId();

const randomColor = () => {
  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  const a = Math.floor(Math.random() * 255);
  return `#${hh(r)}${hh(g)}${hh(b)}${hh(a)}`;
};

const hh = (n) => n.toString(16).padStart(2, '0');

const question = $('#game div.question');
const answers = $$('#game div.answers div');

const showCard = (card, deck) => {
  card.asked++;
  question.innerText = card.q;
  const answerPosition = Math.floor(Math.random() * answers.length);
  const r = shuffled(card.d);
  r.splice(answerPosition, 0, card.a);
  shuffled(questionColors).forEach((c, i) => {
    answers[i].style.background = c;
  });
  answers.forEach((e, i) => {
    e.innerText = r[i]
    if (i == answerPosition) {
      e.onclick = () => {
        deck.correct(card);
        next();
      };
    } else {
      e.onclick = () => {
        deck.incorrect(card);
        next();
      };
    }
  });
};


const cards = [
  {q: "2 + 2", a: 4, d: [1, 3, 5]},
  {q: "10 * 10", a: 100, d: [10, 1, 0]},
  {q: "Would a cow lick Lot's wife? ", a: "Yes", d: ["No", "Maybe", "Yuck"]},
  {q: "What's up? ", a: "Chicken butt", d: ["What?", "Not much.", "'Sup"]},
];

let current = null;

let deck = new State(cards, [2, 3, 5, 8]);

const next = () => {
  current = deck.nextCard();
  if (current === null) {
    console.log('done');
    // FIXME: update
    doc.game.replaceChildren();
  } else {
    showCard(current, deck);
  }
  console.log(JSON.stringify(deck.deck.map(c => ({q: c.q, asked: c.asked, pile: c.pile.size })), null, 2));
  //console.log(`Current: ${JSON.stringify(current)}`);
  //console.log(deck.summary());
}

next();
