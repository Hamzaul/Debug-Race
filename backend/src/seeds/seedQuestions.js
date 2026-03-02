const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('../models/Question');

dotenv.config();

const sampleQuestions = [
  // Python MCQ - Level 1
  {
    type: 'MCQ',
    language: 'Python',
    difficulty: 1,
    topic: 'variables',
    question: 'What will be the output of: x = 5; print(type(x))?',
    code: 'x = 5\nprint(type(x))',
    options: [
      { id: 'A', text: "<class 'int'>" },
      { id: 'B', text: "<class 'str'>" },
      { id: 'C', text: "<class 'float'>" },
      { id: 'D', text: "<class 'number'>" }
    ],
    correctAnswer: 'A',
    explanation: 'In Python, 5 is an integer, so type(x) returns <class \'int\'>.',
    timeLimit: 30
  },
  {
    type: 'MCQ',
    language: 'Python',
    difficulty: 1,
    topic: 'strings',
    question: 'What is the output of: print("Hello"[1])?',
    code: 'print("Hello"[1])',
    options: [
      { id: 'A', text: 'H' },
      { id: 'B', text: 'e' },
      { id: 'C', text: 'l' },
      { id: 'D', text: 'Error' }
    ],
    correctAnswer: 'B',
    explanation: 'String indexing starts at 0, so index 1 gives the second character "e".',
    timeLimit: 30
  },
  // Python DEBUG - Level 1
  {
    type: 'DEBUG',
    language: 'Python',
    difficulty: 1,
    topic: 'syntax',
    question: 'Find the bug in this code:',
    code: 'def greet(name)\n    print("Hello, " + name)\n\ngreet("World")',
    options: [
      { id: 'A', text: 'Missing colon after function definition' },
      { id: 'B', text: 'Wrong indentation' },
      { id: 'C', text: 'Missing parentheses in print' },
      { id: 'D', text: 'Wrong string concatenation' }
    ],
    correctAnswer: 'A',
    explanation: 'Python function definitions require a colon after the parameters: def greet(name):',
    timeLimit: 45
  },
  // Java MCQ - Level 2
  {
    type: 'MCQ',
    language: 'Java',
    difficulty: 2,
    topic: 'arrays',
    question: 'What is the length of: int[] arr = {1, 2, 3, 4, 5};?',
    code: 'int[] arr = {1, 2, 3, 4, 5};\nSystem.out.println(arr.length);',
    options: [
      { id: 'A', text: '4' },
      { id: 'B', text: '5' },
      { id: 'C', text: '6' },
      { id: 'D', text: 'Error' }
    ],
    correctAnswer: 'B',
    explanation: 'The array contains 5 elements, so arr.length returns 5.',
    timeLimit: 30
  },
  // Java DEBUG - Level 2
  {
    type: 'DEBUG',
    language: 'Java',
    difficulty: 2,
    topic: 'loops',
    question: 'Find the infinite loop bug:',
    code: 'for (int i = 0; i < 10; i--) {\n    System.out.println(i);\n}',
    options: [
      { id: 'A', text: 'Change i-- to i++' },
      { id: 'B', text: 'Change i < 10 to i > 10' },
      { id: 'C', text: 'Change int i = 0 to int i = 10' },
      { id: 'D', text: 'Add break statement' }
    ],
    correctAnswer: 'A',
    explanation: 'The loop decrements i instead of incrementing, causing an infinite loop. Change i-- to i++.',
    timeLimit: 45
  },
  // C MCQ - Level 3
  {
    type: 'MCQ',
    language: 'C',
    difficulty: 3,
    topic: 'pointers',
    question: 'What does *ptr mean if int *ptr = &x;?',
    code: 'int x = 10;\nint *ptr = &x;\nprintf("%d", *ptr);',
    options: [
      { id: 'A', text: 'Address of x' },
      { id: 'B', text: 'Value of x' },
      { id: 'C', text: 'Size of x' },
      { id: 'D', text: 'Type of x' }
    ],
    correctAnswer: 'B',
    explanation: '*ptr dereferences the pointer, giving the value stored at the address (10).',
    timeLimit: 30
  },
  // JavaScript MCQ - Level 3
  {
    type: 'MCQ',
    language: 'JavaScript',
    difficulty: 3,
    topic: 'closures',
    question: 'What will this code output?',
    code: 'function outer() {\n  let x = 10;\n  return function() { return x; };\n}\nconst inner = outer();\nconsole.log(inner());',
    options: [
      { id: 'A', text: 'undefined' },
      { id: 'B', text: '10' },
      { id: 'C', text: 'null' },
      { id: 'D', text: 'Error' }
    ],
    correctAnswer: 'B',
    explanation: 'Closures allow inner functions to access outer function variables. x is captured in the closure.',
    timeLimit: 30
  },
  // Python MCQ - Level 4
  {
    type: 'MCQ',
    language: 'Python',
    difficulty: 4,
    topic: 'algorithms',
    question: 'What is the time complexity of this code?',
    code: 'def find(arr, target):\n    for i in range(len(arr)):\n        for j in range(len(arr)):\n            if arr[i] + arr[j] == target:\n                return True\n    return False',
    options: [
      { id: 'A', text: 'O(n)' },
      { id: 'B', text: 'O(n log n)' },
      { id: 'C', text: 'O(n²)' },
      { id: 'D', text: 'O(2^n)' }
    ],
    correctAnswer: 'C',
    explanation: 'Two nested loops each iterating n times gives O(n²) time complexity.',
    timeLimit: 30
  },
  // Java DEBUG - Level 4
  {
    type: 'DEBUG',
    language: 'Java',
    difficulty: 4,
    topic: 'recursion',
    question: 'This recursive function causes stack overflow. Fix it:',
    code: 'public int factorial(int n) {\n    return n * factorial(n - 1);\n}',
    options: [
      { id: 'A', text: 'Add base case: if (n <= 1) return 1;' },
      { id: 'B', text: 'Change to factorial(n + 1)' },
      { id: 'C', text: 'Add return statement' },
      { id: 'D', text: 'Change return type to void' }
    ],
    correctAnswer: 'A',
    explanation: 'Recursive functions need a base case to stop recursion. Without it, it recurses infinitely.',
    timeLimit: 45
  },
  // Python MCQ - Level 5
  {
    type: 'MCQ',
    language: 'Python',
    difficulty: 5,
    topic: 'design patterns',
    question: 'Which design pattern is demonstrated here?',
    code: 'class Singleton:\n    _instance = None\n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n        return cls._instance',
    options: [
      { id: 'A', text: 'Factory Pattern' },
      { id: 'B', text: 'Singleton Pattern' },
      { id: 'C', text: 'Observer Pattern' },
      { id: 'D', text: 'Decorator Pattern' }
    ],
    correctAnswer: 'B',
    explanation: 'The Singleton pattern ensures only one instance of a class exists by checking _instance in __new__.',
    timeLimit: 30
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    // Insert sample questions
    await Question.insertMany(sampleQuestions);
    console.log(`Inserted ${sampleQuestions.length} sample questions`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();