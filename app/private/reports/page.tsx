'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from '@/components/ui/switch';

interface Report {
  _id: string;  // Make sure you use _id here if MongoDB is being used
  title: string;
  createdAt: string;
  isPublic: boolean;
  userId: string;
  url: string;
}

const ReportList = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [showMyReports, setShowMyReports] = useState(false);
  const { user } = useUser();
  const router = useRouter();

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

  useEffect(() => {
    if (user) { // Ensure user is not null
      const fetchReports = async () => {
        try {
          const response = await axios.get('/api/documents');
          setReports(response.data.reports);
          console.log("user",user.id)
          console.log("user",response.data.reports)
        //   user && user.id === report.ownerId 
          setFilteredReports(response.data.reports);
        } catch (error) {
          console.error('Error fetching reports:', error);
        }
      };

      fetchReports();
    }
  }, [user]);

  useEffect(() => {
    const filtered = reports.filter((report) =>
      report.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredReports(filtered);
  }, [searchTerm, reports]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = () => {
    const sortedReports = [...filteredReports].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortAscending ? dateA - dateB : dateB - dateA;
    });
    setFilteredReports(sortedReports);
    setSortAscending(!sortAscending);
  };

  const handleShowMyReports = () => {
    if (showMyReports) {
      setFilteredReports(reports);
    } else if (user) {
      const myReports = reports.filter((report) => report.userId === user.id);
      setFilteredReports(myReports);
    }
    setShowMyReports(!showMyReports);
  };

  const handleToggleVisibility = async (reportId: string, currentVisibility: boolean) => {
    console.log('Toggling visibility for:', reportId, 'Current:', currentVisibility);
    try {
      const response = await axios.patch(`/api/documents/${reportId}`, { isPublic: !currentVisibility });
      console.log('API Response:', response.data);
  
      if (response.status === 200) {
        console.log('Updating state...');
        setReports((prevReports) =>
          prevReports.map((report) =>
            report._id === reportId ? { ...report, isPublic: !currentVisibility } : report
          )
        );
        setFilteredReports((prevFilteredReports) =>
          prevFilteredReports.map((report) =>
            report._id === reportId ? { ...report, isPublic: !currentVisibility } : report
          )
        );
      } else {
        console.error('Failed to update visibility:', response.status);
      }
    } catch (error) {
      console.error('Error updating report visibility:', error);
    }
  };
  
  
  return (
    <div>
      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={2}
        className="relative overflow-hidden flex px-16 py-32 md:p-20 bg-slate-800 text-white"
      >
        <div className="flex flex-col mx-auto w-full">
          <div>
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Our Topmost</h3>
          </div>
          <div>
            <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
              Performance Reports
            </h1>
          </div>
          <div>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
              Comprehensive analysis of environmental readings, highlighting temperature, humidity, and air quality trends.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={fadeInAnimationsVariants}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        custom={10}
        className='p-6'
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-500" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={handleSearch}
              className="p-2 border border-gray-500 rounded bg-transparent"
            />
          </div>
          <div className='flex gap-4'>
            <Button onClick={handleSort} className="flex items-center">
              {sortAscending ? (
                <ArrowUpIcon className="h-6 w-6 mr-2" />
              ) : (
                <ArrowDownIcon className="h-6 w-6 mr-2" />
              )}
              Sort by Date
            </Button>
            {user && (
              <Button onClick={handleShowMyReports}>
                {showMyReports ? 'Show All Reports' : 'Show My Reports'}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report._id}  // Ensure using _id if MongoDB
              variants={fadeInAnimationsVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              custom={index}  // Correct use of custom for staggered animation
            >
              <Card className="w-[350px]">
                <CardHeader>
                  <CardTitle className='font-medium'>{report.title}</CardTitle>
                  <CardDescription>{report.createdAt
                    ? new Date(report.createdAt).toLocaleString()
                    : 'No date available'}</CardDescription>
                </CardHeader>
                <CardContent>
                </CardContent>
                <CardFooter className="mt-5 p-5 flex justify-between bg-slate-50 border-t border-[#cae8f6]">
                  <Button variant='blue' className="mt-2" onClick={() => router.push(`/private/reports/${report._id}`)}>
                    View Report
                  </Button>
                  {user && user.id === report.userId && (
                    <div className="flex items-center justify-between mt-4">
                      <span>Public:</span>
                      <Switch
                        checked={report.isPublic}
                        onClick={() => handleToggleVisibility(report._id, report.isPublic)}
                        className={`${report.isPublic ? 'bg-[#00A4EF]' : 'bg-gray-200'
                          } relative inline-flex h-6 w-11 items-center rounded-full`}
                      >
                        <span className="sr-only">Toggle Visibility</span>
                        <span
                          className={`${report.isPublic ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                        />
                      </Switch>
                    </div>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          {filteredReports.length === 0 && (
            <p className="text-center col-span-3 text-gray-500">No reports found.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportList;
