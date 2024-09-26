'use client'
import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventClickArg, DateSelectArg, EventDropArg } from '@fullcalendar/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveAs } from 'file-saver';
import { useUser } from '@/context/UserContext';
import {io } from 'socket.io-client';
const socket = io('http://localhost:3001');
import { useActivityTracker } from '@/context/ActivityTracker';


interface CustomEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  type: 'event' | 'meeting';
  email: string; // to store the associated email
}

const FullCalendarScheduler = () => {
  const { user } = useUser();
  const [events, setEvents] = useState<CustomEvent[]>([]);
  const [filter, setFilter] = useState<'all' | 'event' | 'meeting'>('all');
  const [selectInfo, setSelectInfo] = useState<DateSelectArg | null>(null);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'event' | 'meeting'>('event');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<EventClickArg | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string | 'All'>('All');
  const [userEmails, setUserEmails] = useState<{id: string, email: string}[]>([]);
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timeSpent, setTimeSpent] = useState<number>(0); // Initialize with a default value

  useEffect(() => {
    console.log("Current user:", user);
    if(!user)return;
    console.log("incalendar")
    const activityData = {
      userId: user.id, 
      pageUrl: window.location.pathname,
      buttonClicks: {}, 
      timeSpent,
      cursorPosition,
      lastUpdated,
    };
  
    socket.emit('track-activity', activityData);
  }, [user,timeSpent, cursorPosition, lastUpdated]); 


  useEffect(() => {
    const startTime = Date.now();
  
    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      const endTime = Date.now();
      const spentTime = endTime - startTime;
      if (!isNaN(spentTime)) {
        setTimeSpent(spentTime);
      } else {
        console.error('Calculated time spent is NaN');
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserEmails();
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchUserEmails = async () => {
    try {
      if (!user) return;
      const response = await fetch(`/api/email?userId=${user.id}`);
          const emails = await response.json();
          // if (response.ok) {
          //   setUserEmails(data.emails);
          // } 
      // const emails = await response.json();
      setUserEmails([{ id: 'All', email: 'All' }, ...emails]);
    } catch (err) {
      console.error('Error fetching user emails:', err);
    }
  };

  const fetchEvents = async () => {
    try {
      if (!user) return;

      const response = await fetch(`/api/events?userId=${user.id}` );
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setSelectInfo(selectInfo);
    setShowModal(true);
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    console.log('Event Clicked:', clickInfo.event); 
    setEventToDelete(clickInfo);
    setShowDeleteEventModal(true);
  };

  const handleEventDrop = async (changeInfo: EventDropArg) => {
    if (!user) return;
    try {
      const updatedEvent = {
        start: changeInfo.event.start ? changeInfo.event.start.toISOString() : '',  // Convert to string or empty string
        end: changeInfo.event.end ? changeInfo.event.end.toISOString() : '',        // Convert to string or empty string
        allDay: changeInfo.event.allDay,
      };
  
      await fetch(`/api/events/${changeInfo.event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });
  
      setEvents(prevEvents => prevEvents.map(event => {
        if (event.id === changeInfo.event.id) {
          return { ...event, ...updatedEvent };
        }
        return event;
      }));
    } catch (err) {
      console.error('Error updating event:', err);
    }
  };

  const handleAddEvent = async () => {
    if (!selectInfo || !user || !newEventTitle.trim() || !currentEmail) return;

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    const newEvent = {
      title: newEventTitle,
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
      type: newEventType,
      email: currentEmail,
      userId:user.id
    };

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      const data = await response.json();
      setEvents(prevEvents => [...prevEvents, data]);
      calendarApi.addEvent({
        ...data,
        backgroundColor: newEventType === 'event' ? 'blue' : 'green',
        borderColor: newEventType === 'event' ? 'blue' : 'green',
      });
      socket.emit('track-activity', {
        userId: user.id,
        pageUrl: '/private/calendar',
        buttonClicks: { 'events': 1 },
        timeSpent: timeSpent, 
        cursorPosition, 
        lastUpdated, 
      });
    } catch (err) {
      console.error('Error adding event:', err);
    }

    setNewEventTitle('');
    setShowModal(false);
  };

  const handleDeleteEvent = async () => {
    if (!user || !eventToDelete) return;

    // Extracting the event ID from the extendedProps
    const eventId = eventToDelete.event.extendedProps._id;

    if (!eventId) {
        console.error('Error: Event ID is undefined.');
        return;
    }

    try {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            console.error('Error deleting event:', await response.json());
            return;
        }

        await fetchEvents();
        eventToDelete.event.remove(); // Remove the event from the calendar
    } catch (err) {
        console.error('Error deleting event:', err);
    } finally {
        setShowDeleteEventModal(false);
    }
};

  

  const handleEmailChange = (email: string) => {
    setCurrentEmail(email);
  };

  const filteredEvents = filter === 'all' ? events : events.filter(event => event.type === filter);

  const downloadICSFile = () => {
    const icsContent = convertToICS(filteredEvents);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, 'calendar.ics');
  };

  const convertToICS = (events: CustomEvent[]) => {
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';
    events.forEach(event => {
      const endDate = event.end ? formatDateToICS(event.end) : '';
      icsContent += `BEGIN:VEVENT\nSUMMARY:${event.title}\nDTSTART:${formatDateToICS(event.start)}\n${endDate ? `DTEND:${endDate}\n` : ''}END:VEVENT\n`;
    });
    icsContent += 'END:VCALENDAR';
    return icsContent;
  };

  const formatDateToICS = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  return (
    <div className='p-4'>
      <div className="mb-4 text-right">
        <label htmlFor="emailSelect" className="mr-2">Select Email:</label>
        <select
          id="emailSelect"
          value={currentEmail || ''}
          onChange={(e) => handleEmailChange(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          {userEmails.map((email) => (
            <option key={email.id} value={email.email}>{email.email}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="filter" className="mr-2">Filter:</label>
        <select
          id="filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'event' | 'meeting')}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="all">All</option>
          <option value="event">Events</option>
          <option value="meeting">Meetings</option>
        </select>
      </div>

      <div className="mb-4 text-right">
        <Button variant='blue'
          onClick={downloadICSFile}>
          Download Calendar
        </Button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        }}
        initialView="dayGridMonth"
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        events={filteredEvents.map(event => ({
          ...event,
          backgroundColor: event.type === 'event' ? 'blue' : 'green',
          borderColor: event.type === 'event' ? 'blue' : 'green',
        }))}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
      />

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Event Title"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <RadioGroup value={newEventType} onValueChange={(value) => setNewEventType(value as 'event' | 'meeting')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="event" id="event" />
                <label htmlFor="event">Event</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="meeting" id="meeting" />
                <label htmlFor="meeting">Meeting</label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button variant="blue" onClick={handleAddEvent}>Add Event</Button>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteEventModal} onOpenChange={setShowDeleteEventModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this event/Meeting?</p>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteEvent}>Delete</Button>
            <Button variant="outline" onClick={() => setShowDeleteEventModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FullCalendarScheduler;
