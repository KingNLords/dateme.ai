import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class names

interface MbtiQuizProps {
  onQuizComplete: (type: "user" | "partner", mbti: string) => void;
  onCancel: () => void;
  quizFor: "user" | "partner"; // To know whose MBTI we are determining
}

// Define the Likert scale options
const likertScaleOptions = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

// Comprehensive questions designed to lean towards one side of a dichotomy.
// Each question implicitly scores for one pole (e.g., 'E' for Extraversion).
// A higher score (4-5) for an 'E' question contributes to 'E', lower (1-2) to 'I'.
const quizStatements = [
  // Extraversion (E) vs. Introversion (I)
  {
    id: 1,
    text: "I feel energized after spending time in large social gatherings.",
    dichotomyPole: "E",
  },
  {
    id: 2,
    text: "I prefer to think things through alone before discussing them with others.",
    dichotomyPole: "I",
  },
  {
    id: 3,
    text: "I often initiate conversations with new people.",
    dichotomyPole: "E",
  },
  {
    id: 4,
    text: "I enjoy quiet evenings at home more than going out.",
    dichotomyPole: "I",
  },
  {
    id: 5,
    text: "I am comfortable being the center of attention.",
    dichotomyPole: "E",
  },

  // Sensing (S) vs. Intuition (N)
  {
    id: 6,
    text: "I pay close attention to practical details and facts.",
    dichotomyPole: "S",
  },
  {
    id: 7,
    text: "I am often drawn to abstract concepts and future possibilities.",
    dichotomyPole: "N",
  },
  {
    id: 8,
    text: "I rely on my past experiences and proven methods to solve problems.",
    dichotomyPole: "S",
  },
  {
    id: 9,
    text: "I enjoy imagining how things could be, rather than focusing on how they are.",
    dichotomyPole: "N",
  },
  {
    id: 10,
    text: "I prefer clear, step-by-step instructions over general guidelines.",
    dichotomyPole: "S",
  },

  // Thinking (T) vs. Feeling (F)
  {
    id: 11,
    text: "When making a decision, I prioritize logic and objective analysis.",
    dichotomyPole: "T",
  },
  {
    id: 12,
    text: "I consider the emotional impact of my decisions on others.",
    dichotomyPole: "F",
  },
  {
    id: 13,
    text: "I tend to be direct and honest, even if it might upset someone.",
    dichotomyPole: "T",
  },
  {
    id: 14,
    text: "I strive for harmony and prefer to avoid conflict.",
    dichotomyPole: "F",
  },
  {
    id: 15,
    text: "I am generally seen as fair and consistent in my judgments.",
    dichotomyPole: "T",
  },

  // Judging (J) vs. Perceiving (P)
  {
    id: 16,
    text: "I like to have a clear plan and stick to it.",
    dichotomyPole: "J",
  },
  {
    id: 17,
    text: "I prefer to keep my options open and be spontaneous.",
    dichotomyPole: "P",
  },
  {
    id: 18,
    text: "I feel more comfortable when things are settled and decided.",
    dichotomyPole: "J",
  },
  {
    id: 19,
    text: "I enjoy adapting to new situations rather than following a strict schedule.",
    dichotomyPole: "P",
  },
  {
    id: 20,
    text: "I tend to finish tasks well before deadlines.",
    dichotomyPole: "J",
  },
];

// MBTI type descriptions (simplified for brevity, expand as needed)
const mbtiDescriptions: Record<string, string> = {
  ISTJ: "Practical, factual, and responsible. Loyal and organized.",
  ISFJ: "Warm, conscientious, and dedicated. Supportive and reliable.",
  INFJ: "Insightful, empathetic, and visionary. Idealistic and compassionate.",
  INTJ: "Strategic, independent, and logical. Masterminds.",
  ISTP: "Observant, analytical, and adaptable. Action-oriented problem-solvers.",
  ISFP: "Artistic, gentle, and spontaneous. Appreciative of beauty.",
  INFP: "Creative, idealistic, and values-driven. Seek harmony and meaning.",
  INTP: "Analytical, innovative, and curious. Logical and independent thinkers.",
  ESTP: "Energetic, realistic, and spontaneous. Live in the moment.",
  ESFP: "Outgoing, friendly, and enthusiastic. Enjoy life and people.",
  ENFP: "Creative, enthusiastic, and charismatic. Inspire others.",
  ENTP: "Inventive, stimulating, and quick-witted. Enjoy intellectual challenges.",
  ESTJ: "Organized, decisive, and traditional. Efficient and dependable.",
  ESFJ: "Caring, social, and cooperative. Value harmony and connection.",
  ENFJ: "Charismatic, inspiring, and empathetic. Natural leaders.",
  ENTJ: "Decisive, strategic, and assertive. Visionary leaders.",
};

export const MbtiQuiz: React.FC<MbtiQuizProps> = ({
  onQuizComplete,
  onCancel,
  quizFor,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Stores scores for each dichotomy pole: { E: X, I: Y, S: Z, N: A, ... }
  const [dichotomyScores, setDichotomyScores] = useState<{
    [key: string]: number;
  }>({
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  });
  const [quizFinished, setQuizFinished] = useState(false);
  const [inferredMbti, setInferredMbti] = useState<string | null>(null);
  const { toast } = useToast();

  const currentStatement = quizStatements[currentQuestionIndex];

  // Effect to handle the automatic closing of the modal after a timeout
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (quizFinished) {
      // Set a timer to call onCancel after 10 seconds
      timer = setTimeout(() => {
        onCancel();
      }, 45000); // Changed to 10000 milliseconds = 10 seconds
    }

    // Cleanup function: Clear the timer if the component unmounts or quizFinished changes
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [quizFinished, onCancel]); // Re-run effect when quizFinished or onCancel changes

  // Handle user's Likert scale answer
  const handleAnswer = (score: number) => {
    const pole = currentStatement.dichotomyPole;
    const oppositePole = getOppositePole(pole);

    // Calculate contribution to each pole based on score
    // Example: For an 'E' question:
    // Score 5 (Strongly Agree) -> +2 to E, -2 to I
    // Score 4 (Agree)          -> +1 to E, -1 to I
    // Score 3 (Neutral)        -> +0 to E, +0 to I
    // Score 2 (Disagree)       -> -1 to E, +1 to I
    // Score 1 (Strongly Disagree)-> -2 to E, +2 to I
    const scoreDelta = score - 3; // Normalize score to -2 to +2 range

    setDichotomyScores((prevScores) => ({
      ...prevScores,
      [pole]: prevScores[pole] + scoreDelta,
      [oppositePole]: prevScores[oppositePole] - scoreDelta, // Subtract from opposite pole
    }));

    // Move to next question or finish quiz
    if (currentQuestionIndex < quizStatements.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      calculateMbti();
    }
  };

  // Helper to get the opposite pole for a dichotomy
  const getOppositePole = (pole: string): string => {
    switch (pole) {
      case "E":
        return "I";
      case "I":
        return "E";
      case "S":
        return "N";
      case "N":
        return "S";
      case "T":
        return "F";
      case "F":
        return "T";
      case "J":
        return "P";
      case "P":
        return "J";
      default:
        return ""; // Should not happen
    }
  };

  const calculateMbti = () => {
    const finalMbti =
      (dichotomyScores.E >= dichotomyScores.I ? "E" : "I") +
      (dichotomyScores.S >= dichotomyScores.N ? "S" : "N") +
      (dichotomyScores.T >= dichotomyScores.F ? "T" : "F") +
      (dichotomyScores.J >= dichotomyScores.P ? "J" : "P");

    setInferredMbti(finalMbti);
    setQuizFinished(true);
    onQuizComplete(quizFor, finalMbti); // Pass result to parent immediately
    toast({
      title: "MBTI Quiz Complete!",
      description: `The inferred MBTI type for ${
        quizFor === "user" ? "you" : "your partner"
      } is: ${finalMbti}.`,
      variant: "default",
    });
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setDichotomyScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setQuizFinished(false);
    setInferredMbti(null);
  };

  const progress = ((currentQuestionIndex + 1) / quizStatements.length) * 100;

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl border-pink-100 dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold dark:text-white">
          Discover {quizFor === "user" ? "Your" : "Partner's"} MBTI
        </CardTitle>
        <CardDescription className="text-center text-gray-600 dark:text-gray-300">
          Answer these questions to infer your personality type.
        </CardDescription>
        {!quizFinished && (
          <Progress
            value={progress}
            className="w-full mt-4 h-2 bg-pink-100 dark:bg-gray-700 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-pink-500 [&::-webkit-progress-value]:to-rose-500"
          />
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {!quizFinished ? (
          <>
            <p className="text-lg font-medium text-center dark:text-gray-200">
              {currentStatement.text}
            </p>
            <div className="flex flex-col space-y-3">
              {likertScaleOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  className={cn(
                    "w-full py-3 text-base border-pink-200 hover:bg-pink-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200"
                    // Optional: Add a visual indicator if an answer was previously selected for this question
                    // This would require tracking answers per question, not just dichotomy scores
                  )}
                  onClick={() => handleAnswer(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button
                variant="ghost"
                onClick={onCancel}
                className="dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              {currentQuestionIndex > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Previous
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center space-y-4">
            <h4 className="text-2xl font-bold text-pink-600 dark:text-pink-300">
              Your MBTI Type: {inferredMbti}
            </h4>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              {mbtiDescriptions[inferredMbti || ""] ||
                "A unique and valuable personality!"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This is an inferred type based on your answers. MBTI is a tool for
              self-understanding and growth.
            </p>
            <div className="flex flex-col space-y-3 mt-6">
              <Button
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                onClick={onCancel} // Close quiz immediately if user clicks "Done"
              >
                Done
              </Button>
              <Button
                variant="outline"
                className="w-full border-pink-200 hover:bg-pink-50 dark:border-gray-600 dark:hover:bg-gray-700"
                onClick={handleRetakeQuiz}
              >
                Retake Quiz
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
