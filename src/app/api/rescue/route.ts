import { NextResponse } from 'next/server';
import { validateRescueBrief } from '@/lib/rescue/contracts';
import { createPlanner } from '@/lib/rescue/planner';
import { getDemoUserId } from '@/lib/supabase/admin';
import { persistRescuePlan } from '@/lib/rescue/repository';
import { generateText } from '@/lib/rescue/ai';

async function generateWithAI(prompt: string): Promise<unknown> {
  const { text, source } = await generateText(prompt, true);
  if (!text) throw new Error('Empty response from model');
  const parsed = JSON.parse(text);
  return { ...parsed, _aiSource: source };
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const briefValidation = validateRescueBrief(rawBody);

    if (!briefValidation.success) {
      return NextResponse.json({ error: 'Validation failed', details: briefValidation.errors }, { status: 400 });
    }

    const userId = await getDemoUserId();
    const planner = createPlanner(generateWithAI);
    
    const plan = await planner.plan(briefValidation.data);
    await persistRescuePlan(userId, plan, JSON.stringify(briefValidation.data));

    return NextResponse.json({ 
      success: true, 
      commitment_id: plan.id,
      is_fallback: plan.source === 'fallback'
    }, { status: 201 });

  } catch (error: any) {
    console.error('Planner API error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
