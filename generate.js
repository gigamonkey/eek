import * as cheerio from 'cheerio';
import YAML from 'yaml';
import fs from 'fs';

const questions = fs.readFileSync('./questions.yml', 'utf8')
const template = fs.readFileSync('public/index.html', 'utf8')

const makeQuestion = (question, data) => {
  const distractors = $('<div>').addClass('distractors');
  data.distractors.forEach(d => distractors.append($('<div>').text(d)));
  return $('<div>')
    .append($('<div>').text(question).addClass('q'))
    .append($('<div>').text(data.answer).addClass('answer'))
    .append(distractors);
};

const $ = cheerio.load(template);
const questionsDiv = $('#questions');

questionsDiv.empty();

Object.entries(YAML.parse(questions)).forEach(([q, data]) => {
  questionsDiv.append(makeQuestion(q, data));
});


fs.writeFile('./public/index.html', $.html(), 'utf8', (err) => {
  if (err) throw err;
  console.log('The file has been saved!');
});
