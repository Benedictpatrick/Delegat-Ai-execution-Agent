import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: commitmentsData, error: commitmentsError } = await supabase
      .from('commitments')
      .select('*')
      .order('created_at', { ascending: false });

    if (commitmentsError) throw commitmentsError;

    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('sort_order', { ascending: true });

    if (tasksError) throw tasksError;

    const { data: nexusData, error: nexusError } = await supabase
      .from('nexus_items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (nexusError) {
      console.error('Nexus items table error (likely missing):', nexusError.message);
    }

    return NextResponse.json({ 
      commitments: commitmentsData || [], 
      tasks: tasksData || [],
      nexusItems: nexusData || [] 
    });
  } catch (error: any) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
