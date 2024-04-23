import { byId, $, $$, html } from './dom.js'
import { shuffled } from './random.js';
import { State } from './learn.js';

const nextKeys = new Set(['ArrowRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', ' ', 'Enter']);
const numbers = new Set(['1', '2', '3', '4']);

const questionColors = [
  '#ffd700', // sunny yellow
  '#f28500', // tangerine
  '#ff69b4', // hot pink
  '#32cd32', // lime green
];

const game = $('#game');

const doc = byId();

const question = $('#game div.question');
const answers = $$('#game div.answers div');
const cards = [...$('#questions').children].map(html => ({ html }));
const deck = new State(cards, [ 3, 5 ]);

answers.forEach((e, i) => e.onclick = () => choose(i));

game.remove();

document.onkeydown = (e) => {
  if ($('#splash').offsetParent !== null) {
    $('#splash').style.display = 'none';
    start(game);
  } else {
    if (!currentCard && !locked) {
      next();
    } else if (numbers.has(e.key)) {
      choose(parseInt(e.key - 1));
    }
  }
};

let answerPosition;
let currentCard = null;
let locked = false;

const moveChildren = (from, target) => {
  target.replaceChildren();
  [...from.childNodes].forEach(c => {
    target.appendChild(c);
  });
};


const showCard = (card) => {
  currentCard = card;
  const  html = card.html.cloneNode(true);

  const q = html.querySelector('.q');
  const a = html.querySelector('.answer');
  const d = html.querySelectorAll('.distractors > div');

  answerPosition = Math.floor(Math.random() * answers.length);
  const r = shuffled(d);
  r.splice(answerPosition, 0, a);

  shuffled(questionColors).forEach((c, i) => {
    answers[i].style.background = c;
  });

  moveChildren(q, question);
  answers.forEach((e, i) => moveChildren(r[i], e));
};

const doAnimation = (e, correct, clazz) => {
  e.onanimationend = () => {
    highlightAnswer(correct);
    e.classList.remove(clazz);
    adjustCheese(deck);
    if (clazz === 'zoom') {
      setTimeout(() => {
        next();
        locked = false;
      }, 400);
    } else {
      locked = false;
    }
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
    bar.prepend(c.cheese);
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

const next = () => {
  $$('#game div.answers div.correct').forEach(e => e.classList.remove('correct'));
  const card = deck.nextCard();
  if (card === null) {
    document.body.replaceChildren(html('<img src="mouse.png">'));
  } else {
    showCard(card);
  }
}

const start = (game) => {
  document.body.append(game);
  addCheeseBar(deck.deck);
  adjustCheese(deck);
  next();
};
