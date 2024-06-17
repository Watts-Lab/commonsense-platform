import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import MultiStepForm from './MultiStepForm';
import Backend from "../apis/backend";
import { IQuestionData, questionData } from '../data/questions';

const mockSteps = [
  {
    id: 1,
    answers: [
      "I_agree-Yes",
      "I_agree_reason-Because it is logical",
      "others_agree-No",
      "others_agree_reason-They don't think so",
      "perceived_commonsense-Yes"
    ],
    answereSaved: false
  },
  {
    id: 2,
    answers: [
      "I_agree-No",
      "I_agree_reason-I don't agree",
      "others_agree-Yes",
      "others_agree_reason-They think so",
      "perceived_commonsense-No"
    ],
    answereSaved: false
  }
];

const mockProps = {
  steps: mockSteps,
  pushResultComponent: jest.fn(),
  getNextStatement: jest.fn().mockResolvedValue({ value: { id: 3, statement: 'New statement' } }),
  pushNewStatement: jest.fn(),
  handleAnswerSaving: jest.fn(),
  setUnansweredQuestionIndex: jest.fn(),
  sessionId: 'test-session-id'
};

describe('MultiStepForm', () => {
  test('renders MultiStepForm and progresses through steps', async () => {
    render(<MultiStepForm {...mockProps} />);

    // Check initial step
    expect(screen.getByText('Do you agree with this statement? *')).toBeInTheDocument();

    // Simulate next button click
    fireEvent.click(screen.getByText('Next'));

    // Check the next step
    expect(await screen.findByText('Why did you answer the way you did about yourself? *')).toBeInTheDocument();
  });

  test('saves answers on step completion', async () => {
    render(<MultiStepForm {...mockProps} />);

    // Simulate next button click
    fireEvent.click(screen.getByText('Next'));

    // Check if handleAnswerSaving was called
    expect(mockProps.handleAnswerSaving).toHaveBeenCalledWith(1, true);
  });
});
