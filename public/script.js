import { byId, $, $$, html } from './dom.js'
import { shuffled } from './random.js';
import { State } from './learn2.js';

const nextKeys = new Set(['ArrowRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', ' ', 'Enter']);
const numbers = new Set(['1', '2', '3', '4']);

const questionColors = [
  '#ffd700', // sunny yellow
  '#f28500', // tangerine
  '#ff69b4', // hot pink
  '#32cd32', // lime green
];

const doc = byId();

const question = $('#game div.question');
const answers = $$('#game div.answers div');

answers.forEach((e, i) => e.onclick = () => choose(i));

document.onkeydown = (e) => {
  if (nextKeys.has(e.key) && !currentCard && !locked) {
    next();
  } else if (numbers.has(e.key)) {
    choose(parseInt(e.key - 1));
  }
};

let answerPosition;
let currentCard = null;
let locked = false;

const showCard = (card) => {
  currentCard = card;
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

const doAnimation = (e, correct, clazz) => {
  e.onanimationend = () => {
    highlightAnswer(correct);
    e.classList.remove(clazz);
    adjustCheese(deck);
    locked = false;
  };
  e.classList.add(clazz);
};

const choose = (i) => {
  if (!locked) {
    if (currentCard) {
      locked = true;
      const correct = answers[answerPosition];
      if (i == answerPosition) {
        deck.correct(currentCard);
        doAnimation(answers[i], correct, 'zoom');
      } else {
        deck.incorrect(currentCard);
        doAnimation(answers[i], correct, 'shake');
      }
      currentCard = null;
    } else {
      next();
    }
  }

}

const addCheeseBar = (cards) => {
  const bar = $('#game div.progress');
  cards.forEach(c => {
    c.cheese = html('<span>🧀</span>');
    c.cheese.style.opacity = 0;
    bar.append(c.cheese);
  });
};

const adjustCheese = (deck) => {
  const step = 1.0 / (deck.numPiles);
  deck.deck.forEach(c => c.cheese.style.opacity = step);

  let p = deck.zero.next;
  let opacity = step + step;
  while (p) {
    if (p == deck.last) {
      p.cards.forEach(c => {
        c.cheese.innerText = '🐭';
        c.cheese.style.opacity = 1;
      });
    } else {
      p.cards.forEach(c => c.cheese.style.opacity = opacity);
      opacity += step;
    }
    p = p.next;
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


let deck = new State(cards, [2, 3, 5, 8 ]);

addCheeseBar(cards);
adjustCheese(deck);

const next = () => {
  $$('#game div.answers div.correct').forEach(e => e.classList.remove('correct'));
  const card = deck.nextCard();
  if (card === null) {
    document.body.replaceChildren(html('<img src="mouse.png">'));
  } else {
    showCard(card);
  }
}

next();
