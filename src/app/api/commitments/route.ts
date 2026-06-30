import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { inngest } from '@/lib/inngest/client';

const GEMINI_PROMPT = `You are a task decomposition agent. Given a user's goal/commitment in natural language, analyze it and return a JSON object with:

1. "title": A clear, concise title (max 60 chars)
2. "type": One of: "creative", "coding", "writing", "research", "admin", "meeting", "health", "learning"
3. "importance": 1-5 (5 = critical)
4. "deadline_hours": Estimated hours from now until this should be done (e.g. 24 for tomorrow, 48 for 2 days)
5. "tasks": Array of 2-5 specific, actionable sub-tasks. Each task has:
   - "title": Clear action item (start with a verb)
   - "type": Same categories as above
   - "execution_type": "auto_executable" if an AI agent could do it (web search, drafting, scheduling), or "human_only" if it requires the human
   - "estimated_minutes": Realistic time estimate

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation. Just the JSON object.

Example input: "prepare for my biology exam next week"
Example output:
{
  "title": "Biology Exam Preparation",
  "type": "learning",
  "importance": 4,
  "deadline_hours": 168,
  "tasks": [
    {"title": "Review lecture notes and highlight key topics", "type": "learning", "execution_type": "human_only", "estimated_minutes": 90},
    {"title": "Create flashcards for important terms", "type": "writing", "execution_type": "auto_executable", "estimated_minutes": 30},
    {"title": "Complete practice problems from chapters 5-8", "type": "learning", "execution_type": "human_only", "estimated_minutes": 120},
    {"title": "Schedule 3 focused study sessions in calendar", "type": "admin", "execution_type": "auto_executable", "estimated_minutes": 5}
  ]
}`;

async function analyzeWithGemini(rawInput: string): Promise<{
  title: string;
  type: string;
  importance: number;
  deadline_hours: number;
  tasks: Array<{ title: string; type: string; execution_type: string; estimated_minutes: number }>;
} | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY not set — falling back to smart defaults');
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${GEMINI_PROMPT}\n\nUser input: "${rawInput}"`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      }
    });

    const text = response.text?.trim();
    if (!text) return null;

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Gemini API error:', err);
    return null;
  }
}

function smartFallback(rawInput: string) {
  const input = rawInput.toLowerCase();
  let title: string, type: string, importance = 3, deadlineHours = 48;
  let tasks: Array<{ title: string; type: string; execution_type: string; estimated_minutes: number }>;

  if (input.includes('ppt') || input.includes('presentation') || input.includes('slide') || input.includes('deck')) {
    title = "Create Presentation: " + rawInput.substring(0, 40);
    type = "creative";
    importance = 4;
    deadlineHours = 24;
    tasks = [
      { title: "Research topic and gather key data points", type: "research", execution_type: "auto_executable", estimated_minutes: 30 },
      { title: "Draft presentation outline with talking points", type: "writing", execution_type: "human_only", estimated_minutes: 30 },
      { title: "Design slides with visuals and charts", type: "creative", execution_type: "human_only", estimated_minutes: 60 },
      { title: "Rehearse presentation and refine timing", type: "admin", execution_type: "human_only", estimated_minutes: 20 },
    ];
  } else if (input.includes('hackathon') || input.includes('project') || input.includes('build') || input.includes('app')) {
    title = "Build Project: " + rawInput.substring(0, 40);
    type = "coding";
    importance = 5;
    deadlineHours = 36;
    tasks = [
      { title: "Define architecture and select tech stack", type: "research", execution_type: "human_only", estimated_minutes: 30 },
      { title: "Set up project scaffold and repository", type: "coding", execution_type: "auto_executable", estimated_minutes: 15 },
      { title: "Implement core features and API endpoints", type: "coding", execution_type: "human_only", estimated_minutes: 180 },
      { title: "Build frontend UI and connect to backend", type: "coding", execution_type: "human_only", estimated_minutes: 120 },
      { title: "Test end-to-end and fix critical bugs", type: "coding", execution_type: "human_only", estimated_minutes: 60 },
    ];
  } else if (input.includes('research') || input.includes('paper') || input.includes('essay') || input.includes('report')) {
    title = "Write: " + rawInput.substring(0, 45);
    type = "writing";
    importance = 4;
    deadlineHours = 72;
    tasks = [
      { title: "Search and compile relevant sources", type: "research", execution_type: "auto_executable", estimated_minutes: 45 },
      { title: "Create detailed outline with thesis statement", type: "writing", execution_type: "human_only", estimated_minutes: 30 },
      { title: "Draft first version of the document", type: "writing", execution_type: "human_only", estimated_minutes: 120 },
      { title: "Proofread, cite sources, and format", type: "writing", execution_type: "auto_executable", estimated_minutes: 30 },
    ];
  } else if (input.includes('exam') || input.includes('study') || input.includes('learn') || input.includes('course')) {
    title = "Study: " + rawInput.substring(0, 45);
    type = "learning";
    importance = 4;
    deadlineHours = 48;
    tasks = [
      { title: "Review key materials and take notes", type: "learning", execution_type: "human_only", estimated_minutes: 60 },
      { title: "Create summary flashcards", type: "writing", execution_type: "auto_executable", estimated_minutes: 20 },
      { title: "Practice with sample problems or quizzes", type: "learning", execution_type: "human_only", estimated_minutes: 90 },
      { title: "Schedule focused study blocks in calendar", type: "admin", execution_type: "auto_executable", estimated_minutes: 5 },
    ];
  } else if (input.includes('meet') || input.includes('call') || input.includes('interview')) {
    title = "Prepare: " + rawInput.substring(0, 45);
    type = "meeting";
    importance = 3;
    deadlineHours = 24;
    tasks = [
      { title: "Research attendees and prepare talking points", type: "research", execution_type: "auto_executable", estimated_minutes: 20 },
      { title: "Draft agenda and share with participants", type: "writing", execution_type: "auto_executable", estimated_minutes: 10 },
      { title: "Block calendar time and set reminders", type: "admin", execution_type: "auto_executable", estimated_minutes: 5 },
    ];
  } else if (input.includes('email') || input.includes('mail') || input.includes('reply') || input.includes('send')) {
    title = "Email: " + rawInput.substring(0, 45);
    type = "admin";
    importance = 2;
    deadlineHours = 4;
    tasks = [
      { title: "Draft email with key points", type: "writing", execution_type: "auto_executable", estimated_minutes: 10 },
      { title: "Review tone and proofread", type: "admin", execution_type: "human_only", estimated_minutes: 5 },
    ];
  } else {
    title = rawInput.length > 50 ? rawInput.substring(0, 50) + "..." : rawInput;
    type = "admin";
    importance = 3;
    deadlineHours = 48;
    tasks = [
      { title: "Break down the goal into specific steps", type: "admin", execution_type: "human_only", estimated_minutes: 15 },
      { title: "Identify required resources and dependencies", type: "research", execution_type: "auto_executable", estimated_minutes: 10 },
      { title: "Execute primary action items", type: "admin", execution_type: "human_only", estimated_minutes: 60 },
    ];
  }

  return { title, type, importance, deadline_hours: deadlineHours, tasks };
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get or create user
    let userId: string;
    const { data: fallbackUser } = await supabase.from('users').select('id').limit(1).single();
    if (fallbackUser) {
      userId = fallbackUser.id;
    } else {
      const { data: { users } } = await supabase.auth.admin.listUsers();
      if (users && users.length > 0) {
        userId = users[0].id;
        await supabase.from('users').upsert({ id: userId, email: users[0].email, timezone: 'UTC' });
      } else {
        const { data: authData, error: createError } = await supabase.auth.admin.createUser({
          email: 'demo@delegat.app',
          password: 'Password123!',
          email_confirm: true,
          user_metadata: { full_name: 'Demo User' }
        });
        if (createError) {
          return NextResponse.json({ error: 'Failed to create user: ' + createError.message }, { status: 400 });
        }
        userId = authData.user.id;
        await supabase.from('users').upsert({ id: userId, email: 'demo@delegat.app', timezone: 'UTC' });
      }
    }

    const body = await request.json();
    const { raw_input } = body;

    if (!raw_input) {
      return NextResponse.json({ error: 'raw_input is required' }, { status: 400 });
    }

    // 1. Insert raw commitment
    const { data: commitment, error } = await supabase
      .from('commitments')
      .insert({
        user_id: userId,
        raw_input,
        status: 'processing',
        source_type: 'text',
        importance: 3
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Analyze with Gemini (real AI) or fall back to smart defaults
    const analysis = await analyzeWithGemini(raw_input) || smartFallback(raw_input);

    // 3. Update commitment with analysis
    const deadline = new Date(Date.now() + analysis.deadline_hours * 3600000).toISOString();
    await supabase
      .from('commitments')
      .update({
        title: analysis.title,
        type: analysis.type,
        importance: analysis.importance,
        deadline,
        status: 'active'
      })
      .eq('id', commitment.id);

    // 4. Insert tasks
    const taskInserts = analysis.tasks.map((t, i) => ({
      commitment_id: commitment.id,
      user_id: userId,
      title: t.title,
      type: t.type,
      execution_type: t.execution_type,
      estimated_minutes: t.estimated_minutes,
      sort_order: i + 1,
      status: 'pending'
    }));

    let insertedTasks: any[] = [];
    if (taskInserts.length > 0) {
      const { data: createdTasks, error: taskError } = await supabase.from('tasks').insert(taskInserts).select();
      if (taskError) {
        console.error("Task Insert Error:", taskError);
      } else if (createdTasks) {
        insertedTasks = createdTasks;
      }
    }

    // Dispatch Inngest events for auto-executable tasks
    const autoTasks = insertedTasks.filter(t => t.execution_type === 'auto_executable');
    for (const task of autoTasks) {
      await inngest.send({
        name: 'agent/execute.task',
        data: {
          taskId: task.id,
          commitmentId: commitment.id,
          userId: userId,
          title: task.title,
          type: task.type
        }
      });
    }

    // 5. Insert initial nexus feed item for decomposition
    const nexusInserts = [
      {
        user_id: userId,
        commitment_id: commitment.id,
        type: 'commitment_decomposed',
        title: `Goal Analyzed${process.env.GEMINI_API_KEY ? ' by Gemini' : ''}`,
        details: `Identified ${analysis.tasks.length} actionable tasks. Type: ${analysis.type}, Priority: ${analysis.importance}/5`,
        status: 'success'
      },
      {
        user_id: userId,
        commitment_id: commitment.id,
        type: 'calendar_booked',
        title: 'Timeline Set',
        details: `Deadline: ${new Date(deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
        status: 'success'
      }
    ];

    const { error: nexusError } = await supabase.from('nexus_items').insert(nexusInserts);
    if (nexusError) console.error("Nexus Insert Error:", nexusError);

    // 6. Return updated commitment
    const { data: updatedCommitment } = await supabase
      .from('commitments')
      .select('*')
      .eq('id', commitment.id)
      .single();

    return NextResponse.json({ 
      success: true, 
      commitment: updatedCommitment || commitment,
      tasks_created: taskInserts.length,
      ai_powered: !!process.env.GEMINI_API_KEY
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error creating commitment:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
