import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

export async function executeAgenticTask(params: {
  taskId: string;
  commitmentId: string;
  userId: string;
  title: string;
  type: string;
}) {
  const { taskId, commitmentId, userId, title, type } = params;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required for autonomous execution.');
  }

  // Update task status to in_progress
  await supabase
    .from('tasks')
    .update({ status: 'in_progress' })
    .eq('id', taskId);

  // Determine what type of output to generate based on the task title
  let prompt = '';
  let nexusType = 'task_completed';
  let nexusTitle = 'Task Completed';

  if (title.toLowerCase().includes('email') || title.toLowerCase().includes('draft')) {
    prompt = `Draft a professional email related to this task: "${title}". Just return the email subject and body in plain text.`;
    nexusType = 'gmail_draft';
    nexusTitle = 'Email Draft Generated';
  } else if (title.toLowerCase().includes('calendar') || title.toLowerCase().includes('schedule')) {
    prompt = `Create a proposed schedule for this task: "${title}". Return a short text describing the proposed date, time, and agenda.`;
    nexusType = 'calendar_booked';
    nexusTitle = 'Schedule Proposed';
  } else if (title.toLowerCase().includes('outline') || title.toLowerCase().includes('document')) {
    prompt = `Create a document outline for this task: "${title}". Return the section headers and a brief summary for each.`;
    nexusType = 'doc_created';
    nexusTitle = 'Document Skeleton Created';
  } else {
    prompt = `Provide a detailed execution summary for this task: "${title}". How would you complete it? Return 2-3 paragraphs.`;
    nexusType = 'task_completed';
    nexusTitle = 'Execution Summary';
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Only enable Google Search grounding for research tasks to save latency
  const configTools: any[] = [];
  if (type === 'research' || title.toLowerCase().includes('research')) {
    configTools.push({ googleSearch: {} });
    prompt += ` Please use Google Search to find up-to-date information and cite your sources.`;
    nexusTitle = 'Research Report (Live Web)';
  }

  // First, notify the UI that streaming is starting
  const streamChannel = supabase.channel('agent_stream');
  
  // Fire off the generation stream
  let generatedContent = '';
  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        tools: configTools.length > 0 ? configTools : undefined,
      }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        generatedContent += chunk.text;
        // Broadcast the chunk to the frontend via Supabase Realtime
        await streamChannel.send({
          type: 'broadcast',
          event: 'typing_chunk',
          payload: { taskId, text: generatedContent }
        });
      }
    }
  } catch (error) {
    console.error('Error generating content:', error);
    generatedContent = 'Failed to execute task autonomously due to AI error.';
  } finally {
    // Notify frontend that stream is complete
    await streamChannel.send({
      type: 'broadcast',
      event: 'typing_complete',
      payload: { taskId, text: generatedContent }
    });
    // Remove the channel
    await supabase.removeChannel(streamChannel);
  }

  // Mark task as completed
  await supabase
    .from('tasks')
    .update({ status: 'completed' })
    .eq('id', taskId);

  // Insert final output into nexus_items for the War Room UI
  await supabase.from('nexus_items').insert({
    user_id: userId,
    commitment_id: commitmentId,
    type: nexusType,
    title: nexusTitle,
    details: generatedContent,
    status: 'success'
  });

  return { success: true, details: generatedContent };
}
