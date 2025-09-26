'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CalendarDays, Clock, MapPin, Users, Plus, Search, Filter, Star } from 'lucide-react';
import { SocialEvent, EventType, LocationType } from '@/types/community-features';

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: 'meetup', label: 'Meetup', icon: '🤝' },
  { value: 'workshop', label: 'Workshop', icon: '🔨' },
  { value: 'webinar', label: 'Webinar', icon: '💻' },
  { value: 'conference', label: 'Conference', icon: '🎤' },
  { value: 'networking', label: 'Networking', icon: '🌐' },
  { value: 'other', label: 'Other', icon: '🎯' }
];

const LOCATION_TYPES: { value: LocationType; label: string; icon: string }[] = [
  { value: 'online', label: 'Online', icon: '💻' },
  { value: 'in_person', label: 'In Person', icon: '🏢' },
  { value: 'hybrid', label: 'Hybrid', icon: '🔄' }
];

export default function EventsPage() {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SocialEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | 'all'>('all');
  const [selectedLocationType, setSelectedLocationType] = useState<LocationType | 'all'>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('start_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock data for demonstration
  useEffect(() => {
    const mockEvents: SocialEvent[] = [
      {
        id: '1',
        title: 'Jewelry Design Workshop',
        description: 'Learn the fundamentals of jewelry design from industry experts. Hands-on experience with various techniques and materials.',
        event_type: 'workshop',
        start_date: '2024-02-15T10:00:00Z',
        end_date: '2024-02-15T17:00:00Z',
        timezone: 'UTC',
        location_type: 'in_person',
        location_address: 'Jewelry Design Studio, 123 Creative Lane, New York, NY',
        max_participants: 25,
        current_participants: 18,
        is_free: false,
        price: 150,
        currency: 'USD',
        organizer_id: 'user1',
        is_featured: true,
        status: 'upcoming',
        created_at: '2024-01-10T09:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: '2',
        title: 'Virtual Gemstone Identification',
        description: 'Join us online for an interactive session on identifying various gemstones. Perfect for beginners and intermediate learners.',
        event_type: 'webinar',
        start_date: '2024-02-20T14:00:00Z',
        end_date: '2024-02-20T16:00:00Z',
        timezone: 'UTC',
        location_type: 'online',
        online_meeting_url: 'https://meet.jewelry.com/gemstone-id',
        max_participants: 100,
        current_participants: 67,
        is_free: true,
        price: 0,
        currency: 'USD',
        organizer_id: 'user2',
        is_featured: false,
        status: 'upcoming',
        created_at: '2024-01-12T11:00:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      },
      {
        id: '3',
        title: 'Jewelry Business Networking Mixer',
        description: 'Connect with fellow jewelry professionals, share insights, and build valuable business relationships.',
        event_type: 'networking',
        start_date: '2024-02-25T18:00:00Z',
        end_date: '2024-02-25T21:00:00Z',
        timezone: 'UTC',
        location_type: 'in_person',
        location_address: 'The Grand Hotel, 456 Luxury Ave, Beverly Hills, CA',
        max_participants: 50,
        current_participants: 42,
        is_free: false,
        price: 75,
        currency: 'USD',
        organizer_id: 'user3',
        is_featured: true,
        status: 'upcoming',
        created_at: '2024-01-15T13:00:00Z',
        updated_at: '2024-01-22T10:15:00Z'
      },
      {
        id: '4',
        title: 'Vintage Jewelry Appraisal Clinic',
        description: 'Bring your vintage pieces for professional appraisal. Learn about the history and value of your jewelry.',
        event_type: 'meetup',
        start_date: '2024-02-28T13:00:00Z',
        end_date: '2024-02-28T17:00:00Z',
        timezone: 'UTC',
        location_type: 'hybrid',
        location_address: 'Antique Jewelry Gallery, 789 Heritage Blvd, Charleston, SC',
        online_meeting_url: 'https://meet.jewelry.com/vintage-clinic',
        max_participants: 40,
        current_participants: 28,
        is_free: false,
        price: 50,
        currency: 'USD',
        organizer_id: 'user4',
        is_featured: false,
        status: 'upcoming',
        created_at: '2024-01-18T15:00:00Z',
        updated_at: '2024-01-25T12:00:00Z'
      },
      {
        id: '5',
        title: 'Annual Jewelry Industry Conference',
        description: 'The premier event for jewelry professionals featuring keynote speakers, panel discussions, and networking opportunities.',
        event_type: 'conference',
        start_date: '2024-03-15T09:00:00Z',
        end_date: '2024-03-17T17:00:00Z',
        timezone: 'UTC',
        location_type: 'in_person',
        location_address: 'Convention Center, 999 Industry Way, Las Vegas, NV',
        max_participants: 500,
        current_participants: 387,
        is_free: false,
        price: 899,
        currency: 'USD',
        organizer_id: 'user5',
        is_featured: true,
        status: 'upcoming',
        created_at: '2024-01-05T10:00:00Z',
        updated_at: '2024-01-28T09:30:00Z'
      }
    ];

    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
    setLoading(false);
  }, []);

  // Filter and sort events
  useEffect(() => {
    let filtered = events;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply event type filter
    if (selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.event_type === selectedEventType);
    }

    // Apply location type filter
    if (selectedLocationType !== 'all') {
      filtered = filtered.filter(event => event.location_type === selectedLocationType);
    }

    // Apply date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (selectedDateRange) {
        case 'today':
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
          });
          break;
        case 'week':
          const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate >= today && eventDate < weekFromNow;
          });
          break;
        case 'month':
          const monthFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.start_date);
            return eventDate >= today && eventDate < monthFromNow;
          });
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof SocialEvent];
      let bValue: any = b[sortBy as keyof SocialEvent];

      if (sortBy === 'start_date' || sortBy === 'end_date' || sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedEventType, selectedLocationType, selectedDateRange, sortBy, sortOrder]);

  const getEventTypeIcon = (type: EventType) => {
    const eventType = EVENT_TYPES.find(t => t.value === type);
    return eventType ? eventType.icon : '🎯';
  };

  const getLocationTypeIcon = (type: LocationType) => {
    const locationType = LOCATION_TYPES.find(t => t.value === type);
    return locationType ? locationType.icon : '📍';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = (event: SocialEvent) => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (now < startDate) return 'upcoming';
    if (now >= startDate && now <= endDate) return 'ongoing';
    if (now > endDate) return 'completed';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Discover and join jewelry industry events, workshops, and networking opportunities
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              +5 this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => getEventStatus(e) === 'upcoming').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.reduce((sum, e) => sum + e.current_participants, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all events
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Events</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {events.filter(e => e.is_featured).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Premium events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
          <TabsTrigger value="past">Past Events</TabsTrigger>
        </TabsList>

        {/* Upcoming Events Tab */}
        <TabsContent value="upcoming" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Find Events</CardTitle>
              <CardDescription>
                Use filters to find events that match your interests and schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedEventType} onValueChange={(value) => setSelectedEventType(value as any)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Event Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Event Types</SelectItem>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedLocationType} onValueChange={(value) => setSelectedLocationType(value as any)}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {LOCATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dates</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="start_date">Start Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="current_participants">Popularity</SelectItem>
                    <SelectItem value="created_at">Created Date</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.filter(e => getEventStatus(e) === 'upcoming').map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center text-white text-xl">
                        {getEventTypeIcon(event.event_type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {event.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getStatusColor(getEventStatus(event))}`}>
                            {getEventStatus(event).charAt(0).toUpperCase() + getEventStatus(event).slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(event.start_date)} - {formatTime(event.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="flex items-center gap-1">
                        {getLocationTypeIcon(event.location_type)}
                        {event.location_type === 'online' ? 'Online Event' : 
                         event.location_type === 'hybrid' ? 'Hybrid Event' : 
                         event.location_address}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.current_participants}/{event.max_participants || '∞'}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {getEventTypeIcon(event.event_type)} {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      {event.is_free ? (
                        <Badge variant="outline" className="text-green-600">Free</Badge>
                      ) : (
                        <div className="text-sm font-semibold">
                          ${event.price} {event.currency}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" size="sm">
                      RSVP
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.filter(e => getEventStatus(e) === 'upcoming').length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No upcoming events found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Try adjusting your search criteria or create a new event
                </p>
                <Button>Create Event</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Other tabs with placeholder content */}
        <TabsContent value="ongoing" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No ongoing events</h3>
              <p className="text-muted-foreground text-center">
                Check back later for live events
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events created yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first event to get started
              </p>
              <Button>Create Event</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No past events</h3>
              <p className="text-muted-foreground text-center">
                Past events will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 