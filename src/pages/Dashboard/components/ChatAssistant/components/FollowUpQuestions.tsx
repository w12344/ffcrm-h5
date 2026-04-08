import React from 'react';

interface FollowUpQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

const FollowUpQuestions: React.FC<FollowUpQuestionsProps> = ({ 
  questions, 
  onQuestionClick 
}) => {
  if (!questions || questions.length === 0) {
    return null;
  }

  return (
    <div className="follow-up-questions">
      {questions.map((question, index) => (
        <button
          key={index}
          className="follow-up-btn"
          onClick={() => onQuestionClick(question)}
        >
          {question}
          <span className="arrow-icon">→</span>
        </button>
      ))}
    </div>
  );
};

export default FollowUpQuestions;
