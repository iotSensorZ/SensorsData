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
import { cornersOfRectangle } from '@dnd-kit/core/dist/utilities/algorithms/helpers';

interface Report {
  _id: string;  // Ensure this is _id if using MongoDB
  title: string;
  createdAt: string;
  isPublic: boolean;
  userId: string;
  url: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicUrl: string;
}

const ReportList = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const { user } = useUser();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

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

  // Fetch users
  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/user'); // Adjust this API endpoint as needed
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const users = await response.json();
      setUsers(users);
      if (user) {
        setSelectedUserId(user.id);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchAllUsers(); // Fetch users on component mount
  }, []);

  // Fetch reports for selected user
  useEffect(() => {
    if(!user)return;
    const fetchReports = async () => {
        if (selectedUserId) {
            try {
                const response = await axios.get('/api/documents', { 
                    params: { userId: selectedUserId },
                    headers: { 'current-user-id': user.id } // Pass the current user's ID in headers
                });

                // Log the reports returned from the API
                console.log('Fetched reports:', response.data.reports);

                setReports(response.data.reports);
                setFilteredReports(response.data.reports);
                
                // Additional logging for the selected user and current user
                console.log('Selected User ID:', selectedUserId);
                console.log('Current User ID:', user.id);
                
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        } else if (user) {
            try {
                const response = await axios.get('/api/documents', { 
                    params: { userId: user.id } 
                });
                
                // Log the reports returned for the current user
                console.log('Fetched reports for current user:', response.data.reports);

                setReports(response.data.reports);
                setFilteredReports(response.data.reports);
                
            } catch (error) {
                console.error('Error fetching reports:', error);
            }
        }
    };

    fetchReports();
}, [selectedUserId, user]);

  // Filter reports based on search term
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

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId); // Set the selected user ID
    setSearchTerm(''); // Clear search when a user is selected
  };

  const handleToggleVisibility = async (reportId: string, currentVisibility: boolean) => {
    try {
      const response = await axios.patch(`/api/documents/${reportId}`, { isPublic: !currentVisibility });
      if (response.status === 200) {
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

      <div className="flex h-screen">
        {/* User List */}
        <div className="w-1/5 p-4 border-r border-gray-100 bg-white h-screen overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Members</h2>
          <ul>
            {users.map((user) => (
              <li key={user._id} className="mb-2 p-2 border-b-2">
                <button
                  className="text-slate-500 font-medium hover:underline flex gap-3"
                  onClick={() => handleUserClick(user._id)}
                >
                  {user.firstName} {user.lastName}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Reports Section */}
        <div className="flex-1 p-4">
          <motion.div className="mb-4 flex items-center justify-between">
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
            <Button onClick={handleSort} className="flex items-center">
              {sortAscending ? (
                <ArrowUpIcon className="h-6 w-6 mr-2" />
              ) : (
                <ArrowDownIcon className="h-6 w-6 mr-2" />
              )}
              Sort by Date
            </Button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.length > 0 ? (
              filteredReports.map((report, index) => (
                <motion.div
                  key={report._id} // Ensure using _id if MongoDB
                  variants={fadeInAnimationsVariants}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  custom={index} // Correct use of custom for staggered animation
                >
                  <Card className="w-[300px]">
                    <CardHeader>
                      <CardTitle className='font-medium'>{report.title}</CardTitle>
                      <CardDescription>{report.createdAt
                        ? new Date(report.createdAt).toLocaleString()
                        : 'No date available'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Add any additional content if needed */}
                    </CardContent>
                    <CardFooter className="mt-5 p-3 flex justify-between bg-slate-50 border-t border-[#cae8f6]">
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
                                } inline-block h-2 w-2 transform bg-white rounded-full transition`}
                            />
                          </Switch>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))
            ) : (
              <p className="text-center col-span-3 text-gray-500">No reports till now.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportList;
