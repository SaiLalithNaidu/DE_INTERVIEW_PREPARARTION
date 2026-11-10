import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const SAMPLE_QUIZ_QUESTIONS = [
  {
    id: 1,
    question: "Which of the following is true regarding PySpark DataFrames vs RDDs?",
    options: [
      "RDDs are faster because they don't have schema overhead.",
      "DataFrames are optimized by Catalyst Optimizer and Tungsten execution engine.",
      "PySpark DataFrames run slower than Scala DataFrames due to Py4J serialization.",
      "DataFrames do not support SQL expressions."
    ],
    correctIndex: 1,
    explanation: "DataFrames benefit from Catalyst Optimizer (logical/physical query plans) and Tungsten (compact off-heap binary format), giving identical performance across Python and Scala."
  },
  {
    id: 2,
    question: "What is the primary purpose of key salting when tuning a skewed join in Apache Spark?",
    options: [
      "To encrypt sensitive customer identifiers in parquet files.",
      "To compress partition files into Snappy format.",
      "To evenly distribute high-cardinality hot keys across multiple executor tasks.",
      "To convert RDDs into Datasets."
    ],
    correctIndex: 2,
    explanation: "Key salting adds random integers (e.g. 0-9) to skewed keys in one table and replicates corresponding keys in the lookup table, eliminating single-task bottlenecks."
  },
  {
    id: 3,
    question: "In SQL, how does DENSE_RANK() differ from RANK() when two rows have the same value?",
    options: [
      "DENSE_RANK() always assigns random numbers.",
      "RANK() assigns consecutive numbers without gaps; DENSE_RANK() skips numbers.",
      "DENSE_RANK() does not skip rank numbers on ties; RANK() skips numbers after ties.",
      "There is no difference between them."
    ],
    correctIndex: 2,
    explanation: "For tied values 100, 100, 90: RANK() assigns 1, 1, 3 (skips 2), whereas DENSE_RANK() assigns 1, 1, 2 (no gaps)."
  },
  {
    id: 4,
    question: "Why are Python generators preferred over lists when parsing 10GB server logs?",
    options: [
      "Generators compile code directly into C++ binaries.",
      "Generators evaluate values lazily with yield and use O(1) constant memory.",
      "Generators automatically upload files to AWS S3.",
      "Generators support multithreading natively without GIL."
    ],
    correctIndex: 1,
    explanation: "Generators yield items on demand without loading the full 10GB dataset into memory at once, avoiding Out-Of-Memory (OOM) fatal crashes."
  },
  {
    id: 5,
    question: "What is an Idempotent Data Pipeline?",
    options: [
      "A pipeline that runs only on streaming Kafka topics.",
      "A pipeline that produces the exact same output without duplicate records even when re-executed.",
      "A pipeline written strictly in Scala.",
      "A pipeline that doesn't use SQL window functions."
    ],
    correctIndex: 1,
    explanation: "An idempotent pipeline can be retried safely multiple times on the same input dataset without creating duplicate rows or state corruption."
  }
];

export default function QuizView() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const handleSelect = (optionIdx) => {
    if (selectedAnswers[currentIdx] !== undefined) return; // already answered this question
    setSelectedAnswers(prev => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const currentQ = SAMPLE_QUIZ_QUESTIONS[currentIdx];
  const answered = selectedAnswers[currentIdx] !== undefined;
  const isCorrect = selectedAnswers[currentIdx] === currentQ.correctIndex;

  const handleNext = () => {
    if (currentIdx < SAMPLE_QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
      try {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswers({});
    setIsFinished(false);
  };

  const score = Object.entries(selectedAnswers).filter(
    ([qIdx, ansIdx]) => SAMPLE_QUIZ_QUESTIONS[Number(qIdx)].correctIndex === ansIdx
  ).length;

  return (
    <div className="special-page-container">
      <div className="page-header">
        <div className="header-icon-box green">
          <CheckCircle2 size={24} />
        </div>
        <div>
          <h2>Data Engineer Practice Assessment</h2>
          <p>Test your conceptual understanding across Big Data, Spark, SQL, and Architecture.</p>
        </div>
      </div>

      {!isFinished ? (
        <div className="quiz-card">
          <div className="quiz-header-bar">
            <span>Question {currentIdx + 1} of {SAMPLE_QUIZ_QUESTIONS.length}</span>
            <span className="quiz-score-pill">Score: {score}</span>
          </div>

          <h3 className="quiz-question-title">{currentQ.question}</h3>

          <div className="quiz-options-list">
            {currentQ.options.map((opt, idx) => {
              let optionClass = "quiz-option-btn";
              if (answered) {
                if (idx === currentQ.correctIndex) {
                  optionClass += " correct";
                } else if (idx === selectedAnswers[currentIdx]) {
                  optionClass += " wrong";
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  className={optionClass}
                  onClick={() => handleSelect(idx)}
                  disabled={answered}
                >
                  <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                  <span className="opt-text">{opt}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`quiz-feedback-box ${isCorrect ? 'is-correct' : 'is-wrong'}`}>
              <div className="feedback-heading">
                {isCorrect ? (
                  <>
                    <CheckCircle2 size={16} />
                    <strong>Correct!</strong>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    <strong>Incorrect. Correct answer is option {String.fromCharCode(65 + currentQ.correctIndex)}.</strong>
                  </>
                )}
              </div>
              <p className="feedback-explanation">{currentQ.explanation}</p>
            </div>
          )}

          <div className="quiz-footer">
            <button
              type="button"
              className="btn-next-quiz"
              onClick={handleNext}
              disabled={!answered}
            >
              {currentIdx < SAMPLE_QUIZ_QUESTIONS.length - 1 ? 'Next Question ›' : 'Complete Quiz'}
            </button>
          </div>
        </div>
      ) : (
        <div className="quiz-result-card">
          <div className="result-award-icon">
            <Award size={40} />
          </div>
          <h3>Quiz Assessment Completed!</h3>
          <p className="result-score-summary">
            You scored <strong>{score}</strong> out of <strong>{SAMPLE_QUIZ_QUESTIONS.length}</strong> ({Math.round((score / SAMPLE_QUIZ_QUESTIONS.length) * 100)}%)
          </p>
          <button
            type="button"
            className="btn-restart-quiz"
            onClick={handleRestart}
          >
            <RotateCcw size={16} />
            <span>Retake Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
}

