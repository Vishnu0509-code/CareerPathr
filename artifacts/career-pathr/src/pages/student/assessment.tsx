import React, { useState } from "react";
import { useLocation } from "wouter";
import { useGetAssessmentQuestions, useSubmitAssessment, useGetCurrentUser, getGetCurrentUserQueryKey, getGetAssessmentQuestionsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function Assessment() {
  const [, setLocation] = useLocation();
  const { data: user } = useGetCurrentUser({ query: { queryKey: getGetCurrentUserQueryKey() } });
  
  const { data: questions, isLoading, isError, refetch } = useGetAssessmentQuestions({
    query: { queryKey: getGetAssessmentQuestionsQueryKey(), retry: 1 }
  });

  const submitMutation = useSubmitAssessment({
    mutation: {
      onSuccess: () => {
        setLocation("/recommendations");
      }
    }
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  if (isLoading || !questions) {
    if (isError) {
      return (
        <div className="container mx-auto p-6 max-w-2xl text-center mt-20">
          <h2 className="text-2xl font-heading font-bold mb-3">Unable to load the assessment</h2>
          <p className="text-muted-foreground mb-6">Please make sure the API server is running, then try again.</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      );
    }
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center mt-20">
        <h2 className="text-2xl font-heading font-bold mb-3">Assessment is being prepared</h2>
        <p className="text-muted-foreground">Please refresh this page in a moment. Your assessment has not been submitted.</p>
      </div>
    );
  }

  const question = questions[currentStep];
  const totalSteps = questions.length;
  const progress = ((currentStep) / totalSteps) * 100;
  const isComplete = currentStep >= totalSteps;

  const handleSelect = (value: string) => {
    setAnswers(prev => ({ ...prev, [question.id]: value }));
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, 400); // Short delay to see selection
  };

  const handleSubmit = () => {
    if (!user) return;
    const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
      questionId: parseInt(qId, 10),
      selectedValue: val
    }));
    submitMutation.mutate({ data: { userId: user.id, answers: formattedAnswers } });
  };

  if (isComplete) {
    return (
      <div className="container mx-auto p-4 max-w-2xl min-h-[80vh] flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-heading font-bold">Assessment Complete!</h2>
        <p className="text-lg text-muted-foreground max-w-md">
          We've gathered enough data to map your cognitive strengths to high-growth tech careers.
        </p>
        <Button size="lg" className="h-14 px-8 mt-8 text-lg" onClick={handleSubmit} disabled={submitMutation.isPending}>
          {submitMutation.isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <ArrowRight className="w-5 h-5 mr-2" />}
          Generate My Roadmap
        </Button>
      </div>
    );
  }

  const selectedValue = answers[question.id];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl min-h-[80vh] flex flex-col">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-4 text-sm font-medium text-muted-foreground">
          <span>Question {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full absolute inset-0"
          >
            <h2 className="text-2xl md:text-3xl font-heading font-semibold mb-8 text-center leading-tight">
              {question.text}
            </h2>

            <div className="grid gap-4">
              {question.options.map((opt) => {
                const isSelected = selectedValue === opt.value;
                return (
                  <Card 
                    key={opt.value} 
                    className={`cursor-pointer transition-all duration-200 border-2 ${
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-md scale-[1.02]" 
                        : "hover:border-primary/40 hover:bg-muted/50"
                    }`}
                    onClick={() => handleSelect(opt.value)}
                  >
                    <CardContent className="p-5 flex items-center justify-between">
                      <span className="text-lg font-medium">{opt.label}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-primary" : "border-muted-foreground/30"
                      }`}>
                        {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-8 flex justify-between items-center border-t">
        <Button 
          variant="ghost" 
          onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <span className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded-md">
          {question.category.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
