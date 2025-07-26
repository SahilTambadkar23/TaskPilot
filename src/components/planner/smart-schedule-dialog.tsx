'use client';

import * as React from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { getAISuggestions } from '@/app/actions';
import type { SuggestOptimalTimesOutput } from '@/ai/flows/suggest-optimal-times';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const smartScheduleSchema = z.object({
    activityDescription: z.string().min(5, { message: 'Please describe the activity in more detail.' }),
    userProductivityPatterns: z.string().min(10, { message: 'Please describe your productivity patterns.' }),
});

type SmartScheduleValues = z.infer<typeof smartScheduleSchema>;

const defaultProductivityPatterns = `I'm a morning person. My energy is highest from 9 AM to 12 PM. I experience a slump after lunch, from 1 PM to 3 PM. My energy picks up again from 3 PM to 5 PM for less demanding tasks. Evenings are for relaxing.`;


interface SmartScheduleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getTasksForAI: () => string;
}

export function SmartScheduleDialog({ isOpen, onOpenChange, getTasksForAI }: SmartScheduleDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<SuggestOptimalTimesOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SmartScheduleValues>({
    resolver: zodResolver(smartScheduleSchema),
    defaultValues: {
      activityDescription: '',
      userProductivityPatterns: defaultProductivityPatterns,
    },
  });

  const handleClose = (open: boolean) => {
    if (!open) {
        form.reset({ activityDescription: '', userProductivityPatterns: defaultProductivityPatterns});
        setSuggestions(null);
    }
    onOpenChange(open);
  }

  async function onSubmit(data: SmartScheduleValues) {
    setIsLoading(true);
    setSuggestions(null);
    try {
        const existingSchedule = getTasksForAI();
        const result = await getAISuggestions({ ...data, existingSchedule });
        setSuggestions(result);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not get AI suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const parsedTimes = React.useMemo(() => {
    if (!suggestions?.suggestedTimes) return [];
    try {
      return JSON.parse(suggestions.suggestedTimes);
    } catch {
      return [];
    }
  }, [suggestions]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Smart Schedule Assistant</DialogTitle>
          <DialogDescription>
            Let AI find the perfect time for your new activity.
          </DialogDescription>
        </DialogHeader>
        {!suggestions ? (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                    control={form.control}
                    name="activityDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>New Activity</FormLabel>
                            <FormControl>
                                <Input placeholder="e.g., 'Study for exam for 2 hours'" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="userProductivityPatterns"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Productivity Patterns</FormLabel>
                            <FormControl>
                                <Textarea className="min-h-[100px]" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Get Suggestions
                    </Button>
                </DialogFooter>
            </form>
            </Form>
        ) : (
            <div className="pt-4">
                <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>AI Suggestions</AlertTitle>
                    <AlertDescription className="mt-2">
                        <p className="font-semibold mb-2">Reasoning:</p>
                        <p className="text-sm text-muted-foreground mb-4">{suggestions.reasoning}</p>
                         <p className="font-semibold mb-2">Suggested Times:</p>
                        {parsedTimes.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1">
                                {parsedTimes.map((time: string, index: number) => (
                                    <li key={index} className="text-sm">{time}</li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground">No specific times suggested.</p>
                        )}
                    </AlertDescription>
                </Alert>
                 <DialogFooter className="mt-4">
                    <Button onClick={() => handleClose(false)}>Close</Button>
                </DialogFooter>
            </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
