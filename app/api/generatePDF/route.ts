import puppeteer from 'puppeteer';

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Document } from '@/models/Document';

connectDB();



export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
      const userId = searchParams.get('userId');
      if (!userId) {
        console.log('No user ID provided'); // Debugging log
        return NextResponse.json({ message: 'No user ID provided' }, { status: 400 });
    }

    const reports = await Document.find({});
    const filteredReports = reports.filter(report => report.isPublic || report.userId.toString() === userId);
    return NextResponse.json({ reports:filteredReports }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ message: 'Error fetching reports' }, { status: 500 });
  }
}



export async function POST(req: Request) {
  let browser;
  try {
    const { htmlContent } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4',
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
     });

    await browser.close();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=report.pdf',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ message: 'Error generating PDF' }, { status: 500 });
  }
}