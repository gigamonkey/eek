import { byId, $, $$ } from './dom.js'
import { shuffled } from './random.js';
import { State } from './learn2.js';

const questionColors = [
  '#ffd700', // sunny yellow
  '#f28500', // tangerine
  '#ff69b4', // hot pink
  '#32cd32', // lime green
];

const doc = byId();

const question = $('#game div.question');
const answers = $$('#game div.answers div');

let answerPosition;
let currentCard;

answers.forEach((e, i) => e.onclick = () => choose(i));

const showCard = (card) => {
  currentCard = card;
  card.asked++;
  question.innerText = card.q;
  answerPosition = Math.floor(Math.random() * answers.length);
  const r = shuffled(card.d);
  r.splice(answerPosition, 0, card.a);
  shuffled(questionColors).forEach((c, i) => {
    answers[i].style.background = c;
  });
  answers.forEach((e, i) => {
    e.innerText = r[i]
  });
};

const choose = (i) => {
  if (currentCard) {
    if (i == answerPosition) {
      deck.correct(currentCard);
      highlightAnswer(answers[answerPosition]);
      answers[i].onanimationend = () => {
        highlightAnswer(answers[answerPosition]);
        answers[i].classList.remove('zoom');
      }
      answers[i].classList.add('zoom');
    } else {
      deck.incorrect(currentCard);
      answers[i].onanimationend = () => {
        highlightAnswer(answers[answerPosition]);
        answers[i].classList.remove('shake');
      }
      answers[i].classList.add('shake');
    }
    currentCard = null;
  } else {
    next();
  }
};


const nextKeys = new Set(['ArrowRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', ' ', 'Enter']);
const numbers = new Set(['1', '2', '3', '4']);

document.onkeydown = (e) => {
  if (nextKeys.has(e.key) && !currentCard) {
    next();
  } else if (numbers.has(e.key)) {
    choose(parseInt(e.key - 1));
  }
};

const highlightAnswer = (e) => {
  e.classList.add('correct');
}

const cards = [
  {q: "2 + 2", a: 4, d: [1, 3, 5]},
  {q: "10 * 10", a: 100, d: [10, 1, 0]},
  {q: "Would a cow lick Lot's wife? ", a: "Yes", d: ["No", "Maybe", "Yuck"]},
  {q: "What's up? ", a: "Chicken butt", d: ["What?", "Not much.", "'Sup"]},
];

let current = null;

let deck = new State(cards, [2, 3, 5, 8]);

const next = () => {
  $$('#game div.answers div.correct').forEach(e => e.classList.remove('correct'));
  current = deck.nextCard();
  if (current === null) {
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
