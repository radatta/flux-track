import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/hooks/useUser";
import toast from "react-hot-toast";

export default function LogEntryForm() {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      toast.error("User not found");
      return;
    }
    const formData = new FormData(event.currentTarget);
    const payload = {
      user_id: user.id,
      mood: formData.get("mood"),
      energy: formData.get("energy"),
      notes: formData.get("notes"),
    };
    const res = await fetch("/api/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error || "Failed to log entry");
    } else {
      toast.success("Entry logged successfully");
      event.currentTarget.reset();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-4 bg-card rounded-lg shadow-sm"
    >
      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <Label>Mood (1-10)</Label>
          <Input type="number" name="mood" min="1" max="10" required />
        </div>
        <div className="flex-1">
          <Label>Energy (1-10)</Label>
          <Input type="number" name="energy" min="1" max="10" required />
        </div>
      </div>
      <Textarea name="notes" placeholder="Optional notes..." className="mb-4" />
      <Button type="submit">Log Entry</Button>
    </form>
  );
}
