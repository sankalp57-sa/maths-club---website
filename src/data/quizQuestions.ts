// ============================================================
// MathClub Nexus — Quiz Question Bank
// ============================================================

import type { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  // Algebra
  {
    id: 'q1',
    question: 'If f(x) = 2x³ − 3x² + x − 5, what is f(2)?',
    options: ['1', '3', '5', '−1'],
    correctIndex: 0,
    category: 'algebra',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    question: 'The sum of roots of the equation x² − 7x + 12 = 0 is:',
    options: ['7', '12', '−7', '−12'],
    correctIndex: 0,
    category: 'algebra',
    difficulty: 'easy',
  },
  {
    id: 'q3',
    question: 'If log₂(x) + log₂(x−2) = 3, what is x?',
    options: ['4', '6', '8', '3'],
    correctIndex: 0,
    category: 'algebra',
    difficulty: 'medium',
  },
  // Probability
  {
    id: 'q4',
    question: 'Two fair dice are rolled. What is the probability that the sum is 7?',
    options: ['1/6', '1/12', '5/36', '1/9'],
    correctIndex: 0,
    category: 'probability',
    difficulty: 'easy',
  },
  {
    id: 'q5',
    question: 'A bag contains 5 red, 3 blue, and 2 green balls. If two balls are drawn without replacement, what is the probability both are red?',
    options: ['2/9', '1/4', '5/18', '1/3'],
    correctIndex: 0,
    category: 'probability',
    difficulty: 'medium',
  },
  {
    id: 'q6',
    question: 'In a class of 60 students, 40 play cricket and 30 play football. If 20 play both, how many play neither?',
    options: ['10', '15', '5', '20'],
    correctIndex: 0,
    category: 'probability',
    difficulty: 'medium',
  },
  // Number Theory
  {
    id: 'q7',
    question: 'What is the GCD of 84 and 126?',
    options: ['42', '21', '14', '7'],
    correctIndex: 0,
    category: 'number-theory',
    difficulty: 'easy',
  },
  {
    id: 'q8',
    question: 'The last two digits of 7²⁰²³ are:',
    options: ['43', '07', '49', '01'],
    correctIndex: 0,
    category: 'number-theory',
    difficulty: 'hard',
  },
  {
    id: 'q9',
    question: 'How many prime numbers exist between 1 and 30?',
    options: ['10', '8', '9', '11'],
    correctIndex: 0,
    category: 'number-theory',
    difficulty: 'easy',
  },
  // Logic
  {
    id: 'q10',
    question: 'If all Blips are Blops, and some Blops are Blaps, which must be true?',
    options: [
      'Some Blaps may be Blips',
      'All Blaps are Blips',
      'No Blips are Blaps',
      'All Blops are Blips',
    ],
    correctIndex: 0,
    category: 'logic',
    difficulty: 'medium',
  },
  {
    id: 'q11',
    question: 'What comes next in the sequence: 2, 6, 12, 20, 30, ?',
    options: ['42', '40', '36', '44'],
    correctIndex: 0,
    category: 'logic',
    difficulty: 'easy',
  },
  {
    id: 'q12',
    question: 'A clock shows 3:15. What is the angle between the hour and minute hands?',
    options: ['7.5°', '0°', '15°', '22.5°'],
    correctIndex: 0,
    category: 'logic',
    difficulty: 'medium',
  },
  // More mixed
  {
    id: 'q13',
    question: 'The value of i⁴⁸ + i⁹⁶ + i⁶⁴ is (where i = √−1):',
    options: ['3', '−1', '1', '−3'],
    correctIndex: 0,
    category: 'algebra',
    difficulty: 'medium',
  },
  {
    id: 'q14',
    question: 'If n! has exactly 4 trailing zeros, the smallest such n is:',
    options: ['20', '25', '15', '24'],
    correctIndex: 0,
    category: 'number-theory',
    difficulty: 'hard',
  },
  {
    id: 'q15',
    question: 'Three cards are drawn from a standard 52-card deck. What is the probability that all three are aces?',
    options: ['1/5525', '1/2652', '4/52', '1/13'],
    correctIndex: 0,
    category: 'probability',
    difficulty: 'hard',
  },
];

// Shuffle options for each question (deterministic per session)
export function getShuffledQuestions(): QuizQuestion[] {
  // Deep clone and shuffle options
  return quizQuestions.map(q => {
    const indices = q.options.map((_, i) => i);
    // Fisher-Yates
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const newCorrectIndex = indices.indexOf(q.correctIndex);
    return {
      ...q,
      options: indices.map(i => q.options[i]),
      correctIndex: newCorrectIndex,
    };
  });
}
