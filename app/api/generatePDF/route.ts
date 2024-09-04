import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  try {
    const { htmlContent } = await req.json();

    if (!htmlContent) {
      return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
    }

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({ format: 'A4' });

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