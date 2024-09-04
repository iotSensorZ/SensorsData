'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';

interface Report {
  _id: string;  // Adjusted to use _id for MongoDB
  title: string;
  createdAt: string;
  content: string;  // HTML content from Quill
}

const ReportDetailPage: React.FC = () => {
  const { id } = useParams() as { id: string };
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null); // State for PDF URL
  const { user } = useUser();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`/api/documents?id=${id}`);
        console.log("API Response:", response.data);
        if (response.status === 200 && response.data.reports.length > 0) {
          setReport(response.data.reports[0]);  // Accessing the report correctly
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setReport(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchReport();
  }, [id]);

  const handleGeneratePdf = async () => {
    if (report && report.content) {
      try {
        const response = await axios.post('/api/generatePDF', {
          htmlContent: report.content,
        }, {
          responseType: 'blob', // Important to handle binary data
        });

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        setPdfUrl(url); // Set the URL for the generated PDF
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!report) {
    return <div className="flex items-center justify-center h-full">Report not found or you do not have permission to view this report.</div>;
  }

  return (
    <div className="container mx-auto p-2 flex flex-col h-screen">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{report.title}</h1>
          <p className="text-gray-600">
            {new Date(report.createdAt).toLocaleString()}
          </p>
        </div>
        <Button onClick={handleGeneratePdf} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm">
          Generate PDF
        </Button>
      </div>
      <div className="flex-grow border rounded-md flex">
        {pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="border-0 flex-grow"
            style={{ minHeight: '800px' }}
          >
            <p>
              Your browser does not support PDFs. <a href={pdfUrl}>Download the PDF</a>.
            </p>
          </object>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: report.content }} className="p-4"></div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailPage;
