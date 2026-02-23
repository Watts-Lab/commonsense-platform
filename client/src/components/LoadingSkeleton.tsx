// For initial loading screens of statements form

import ProgressBar from "./ProgressBar";

export function LoadingSkeleton() {
  const TwoTileRow = () => (
    <div className="grid grid-cols-2 gap-2">
      <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
  const FourTileGrid = () => (
    <div className="grid grid-cols-2 gap-2">
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl" />
    </div>
  );
  const QuestionBlock = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      {children}
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 pb-20 pt-4">
      <div className="max-w-3xl mx-auto animate-pulse">
        <ProgressBar currentStep={0} totalSteps={10} />

        <div className="mt-4 flex flex-col w-full max-w-2xl mx-auto">
          {/* Statement header — matches the sticky indigo-bordered header */}
          <div className="sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-indigo-300 dark:border-indigo-700 rounded-b-2xl shadow-sm mb-4 py-5 px-6 flex justify-center">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
          </div>

          <div className="px-4 pb-8 space-y-6">
            {/* Q1: Do you agree? — 2 tiles */}
            <QuestionBlock>
              <TwoTileRow />
            </QuestionBlock>

            {/* Q2: Why (yourself)? — 4 tiles */}
            <QuestionBlock>
              <FourTileGrid />
            </QuestionBlock>

            {/* Q3: Would most others agree? — 2 tiles */}
            <QuestionBlock>
              <TwoTileRow />
            </QuestionBlock>

            {/* Q4: Why (other people)? — 4 tiles */}
            <QuestionBlock>
              <FourTileGrid />
            </QuestionBlock>

            {/* Q5: Common sense? — 2 tiles */}
            <QuestionBlock>
              <TwoTileRow />
            </QuestionBlock>

            {/* Q6: Optional comments — textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/5" />
                <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
              </div>
              <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4 px-4">
          <div className="h-11 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="h-11 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
