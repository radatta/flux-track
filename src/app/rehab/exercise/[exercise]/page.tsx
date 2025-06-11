import { Exercise } from "@/components/Exercise";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ exercise: string }>;
}) {
  const { exercise } = await params;

  return (
    <div className="flex flex-col items-center mt-8">
      <h1 className="text-2xl font-bold mb-2">
        {exercise.charAt(0).toUpperCase() + exercise.slice(1)} Exercise
      </h1>
      <Exercise exercise={exercise} />
    </div>
  );
}
