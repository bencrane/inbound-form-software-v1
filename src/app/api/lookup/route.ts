import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const body = await request.json();
    const { email } = body;

    if (!email) {
        return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const domain = email.split('@')[1];
    if (!domain) {
        return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Initialize Supabase client directly in the API route to ensure fresh context if needed,
    // though using the shared client is also fine. For edge functions, we might want to verify headers.
    // For now, using standard env vars.
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
        const { data, error } = await supabase
            .from('company_lookup')
            .select('name, min_size, max_size')
            .ilike('domain', domain)
            .maybeSingle();

        if (error) {
            console.error('Supabase lookup error:', error);
            return NextResponse.json({ found: false });
        }

        if (data) {
            return NextResponse.json({ found: true, company: data });
        }

        return NextResponse.json({ found: false });
    } catch (e) {
        console.error('Lookup failed:', e);
        return NextResponse.json({ found: false });
    }
}
