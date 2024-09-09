'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import Image from 'next/image';
import Loading from '@/public/images/spinner.gif'
import { motion } from 'framer-motion';

interface Report {
  _id: string;  // Adjusted to use _id for MongoDB
  title: string;
  createdAt: string;
  content: string;  // HTML content from Quill
}

const fadeInAnimationsVariants = {
  initial: {
    opacity: 0,
    y: 100,
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.05 * index,
    },
  }),
};

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
          setReport(response.data.reports[0]);  
          const fetchedReport = response.data.reports.find((r: Report) => r._id === id);
          await handleGeneratePdf(fetchedReport.content)
          console.log("Fetched Report:", fetchedReport);  
          setReport(fetchedReport || null);
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

  const handleGeneratePdf = async (content: string) => {
    if (content) {
      try {
        const response = await axios.post('/api/generatePDF', {
          htmlContent: content,
        }, {
          responseType: 'blob', // Important to handle binary data
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        setPdfUrl(url); // Set the URL for the generated PDF
      console.log("url",url)
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    }
  };

  if (loading) {
    return (
<div className="flex justify-center items-center mt-4">
<Image src={Loading} alt='' width={200} height={200}
/>
  </div>
    );
  }

  if (!report) {
    return <div className="flex items-center justify-center h-full">Report not found or you do not have permission to view this report.</div>;
  }

  return (

    <div >
      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={2}
        className="relative overflow-hidden flex px-16 py-32 md:p-10 bg-slate-800 text-white"
      >
        <div className="flex flex-col mx-auto w-full">
          <div>
            <h1 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-3xl">
            {report.title}
            </h1>
          </div>
          <div>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
            {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="justify-center flex-grow border rounded-md flex">
        {pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="border-0 flex-grow p-4 overflow-hidden"
            style={{ minHeight: '800px' }}
          >
            <p>
              Your browser does not support PDFs. <a href={pdfUrl}>Download the PDF</a>.
            </p>
          </object>
        ) : (
          <div className="flex justify-center items-center mt-4">
<Image src={Loading} alt='' width={200} height={200}
/>
  </div>
        )}
      </div>
    </div>
  );
};

export default ReportDetailPage;
