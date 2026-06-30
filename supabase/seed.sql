-- Demo user (for development and hackathon demo)
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'demo@delegat.app',
    '{"full_name": "Demo User", "avatar_url": "https://avatar.vercel.sh/demo"}'
) ON CONFLICT DO NOTHING;

-- Demo commitments
INSERT INTO public.commitments (id, user_id, title, raw_input, source_type, type, deadline, status, health_score, importance) VALUES
    ('c0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'Research paper on ML in healthcare', 'Research paper on ML in healthcare due Wednesday',
     'text', 'writing', now() + interval '3 days', 'active', 85, 4),
    ('c0000002-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'Reply to client about project scope', 'Reply to client about project scope by tomorrow',
     'email', 'communication', now() + interval '1 day', 'active', 92, 5),
    ('c0000003-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
     'Slides for Tuesday 3pm meeting', 'Create presentation slides for Tuesday 3pm meeting',
     'text', 'meeting_prep', now() + interval '2 days', 'at_risk', 55, 3);
