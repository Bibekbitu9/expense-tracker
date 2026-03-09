import { NextRequest, NextResponse } from 'next/server';

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

export async function POST(request: NextRequest) {
    if (!SCRIPT_URL) {
        return NextResponse.json(
            { success: false, message: 'Google Apps Script URL is not configured on the server.' },
            { status: 500 }
        );
    }

    try {
        const body = await request.json();

        // Validate required fields
        if (!body.date || !body.category || !body.amount || !body.paidBy) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields: date, category, amount, paidBy' },
                { status: 400 }
            );
        }

        const res = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(body),
            redirect: 'follow',
        });

        // Google Apps Script redirects POST → GET, response should be JSON
        const text = await res.text();

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data, { status: data.success ? 200 : 500 });
        } catch {
            // If Google returned HTML (auth page, error page), report it clearly
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                return NextResponse.json(
                    { success: false, message: 'Google Apps Script returned an HTML page instead of JSON. Re-deploy your script with access set to "Anyone".' },
                    { status: 502 }
                );
            }
            return NextResponse.json(
                { success: false, message: `Unexpected response from Google: ${text.substring(0, 200)}` },
                { status: 502 }
            );
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, message: `Server proxy error: ${msg}` },
            { status: 500 }
        );
    }
}

export async function GET() {
    if (!SCRIPT_URL) {
        return NextResponse.json(
            { success: false, message: 'Google Apps Script URL is not configured on the server.' },
            { status: 500 }
        );
    }

    try {
        const res = await fetch(`${SCRIPT_URL}?action=fetch`, {
            method: 'GET',
            redirect: 'follow',
        });

        const text = await res.text();

        try {
            const data = JSON.parse(text);
            return NextResponse.json(data);
        } catch {
            if (text.includes('<!DOCTYPE') || text.includes('<html')) {
                return NextResponse.json(
                    { success: false, message: 'Google Apps Script returned an HTML page. Re-deploy your script with access set to "Anyone".' },
                    { status: 502 }
                );
            }
            return NextResponse.json(
                { success: false, message: `Unexpected response from Google: ${text.substring(0, 200)}` },
                { status: 502 }
            );
        }
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { success: false, message: `Server proxy error: ${msg}` },
            { status: 500 }
        );
    }
}
