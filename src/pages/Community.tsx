import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MessageSquare, TrendingUp, Calendar, Users, Heart, Award } from 'lucide-react';

interface ForumPost {
  id: number;
  title: string;
  author: string;
  avatar: string;
  category: string;
  replies: number;
  likes: number;
  views: number;
  lastActivity: string;
  isPinned?: boolean;
}

interface CommunityMember {
  id: number;
  name: string;
  role: string;
  avatar: string;
  posts: number;
  reputation: number;
}

const Community = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const forumPosts: ForumPost[] = [
    {
      id: 1,
      title: 'Best practices for coordinating with multiple suppliers',
      author: 'Sarah Johnson',
      avatar: 'SJ',
      category: 'Tips & Tricks',
      replies: 24,
      likes: 45,
      views: 328,
      lastActivity: '2 hours ago',
      isPinned: true
    },
    {
      id: 2,
      title: 'How to handle last-minute event changes',
      author: 'Michael Chen',
      avatar: 'MC',
      category: 'Discussion',
      replies: 18,
      likes: 32,
      views: 256,
      lastActivity: '4 hours ago'
    },
    {
      id: 3,
      title: 'Recommended suppliers for corporate events in NYC',
      author: 'Emily Rodriguez',
      avatar: 'ER',
      category: 'Recommendations',
      replies: 42,
      likes: 67,
      views: 512,
      lastActivity: '6 hours ago'
    },
    {
      id: 4,
      title: 'Wedding season planning checklist',
      author: 'David Kim',
      avatar: 'DK',
      category: 'Resources',
      replies: 35,
      likes: 89,
      views: 741,
      lastActivity: '1 day ago',
      isPinned: true
    },
    {
      id: 5,
      title: 'Sustainable event planning ideas',
      author: 'Jessica Martinez',
      avatar: 'JM',
      category: 'Discussion',
      replies: 28,
      likes: 54,
      views: 403,
      lastActivity: '1 day ago'
    }
  ];

  const topMembers: CommunityMember[] = [
    { id: 1, name: 'Sarah Johnson', role: 'Event Producer', avatar: 'SJ', posts: 156, reputation: 2450 },
    { id: 2, name: 'Michael Chen', role: 'Supplier', avatar: 'MC', posts: 142, reputation: 2280 },
    { id: 3, name: 'Emily Rodriguez', role: 'Event Producer', avatar: 'ER', posts: 128, reputation: 2150 },
    { id: 4, name: 'David Kim', role: 'Event Producer', avatar: 'DK', posts: 115, reputation: 1980 },
    { id: 5, name: 'Jessica Martinez', role: 'Supplier', avatar: 'JM', posts: 98, reputation: 1750 }
  ];

  const upcomingEvents = [
    {
      title: 'Community Meetup: Event Planning Best Practices',
      date: 'Feb 15, 2024',
      time: '6:00 PM EST',
      attendees: 45
    },
    {
      title: 'Webinar: Maximizing Supplier Relationships',
      date: 'Feb 22, 2024',
      time: '2:00 PM EST',
      attendees: 128
    },
    {
      title: 'Q&A Session with Industry Experts',
      date: 'Mar 1, 2024',
      time: '4:00 PM EST',
      attendees: 67
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Community</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Connect with fellow event professionals, share knowledge, and grow together
        </p>

        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search discussions, members, and resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="discussions">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="discussions">
                <MessageSquare className="h-4 w-4 mr-2" />
                Discussions
              </TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="events">
                <Calendar className="h-4 w-4 mr-2" />
                Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="discussions" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Recent Discussions</h2>
                <Button>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  New Discussion
                </Button>
              </div>

              {forumPosts.map(post => (
                <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarFallback>{post.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            {post.isPinned && (
                              <Badge variant="secondary" className="mb-2">Pinned</Badge>
                            )}
                            <h3 className="font-semibold hover:text-primary transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              by {post.author} • {post.lastActivity}
                            </p>
                          </div>
                          <Badge variant="outline">{post.category}</Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-3">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {post.replies} replies
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likes} likes
                          </span>
                          <span>{post.views} views</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="w-full">
                Load More Discussions
              </Button>
            </TabsContent>

            <TabsContent value="trending" className="space-y-4 mt-6">
              <h2 className="text-xl font-semibold mb-4">Trending Topics</h2>
              {forumPosts
                .sort((a, b) => b.likes - a.likes)
                .slice(0, 5)
                .map(post => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <Avatar>
                          <AvatarFallback>{post.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                by {post.author}
                              </p>
                            </div>
                            <Badge variant="outline">{post.category}</Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground mt-3">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-primary" />
                              Trending
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {post.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="events" className="space-y-4 mt-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Upcoming Community Events</h2>
                <Button variant="outline">View Calendar</Button>
              </div>

              {upcomingEvents.map((event, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{event.title}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {event.date}
                          </span>
                          <span>{event.time}</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {event.attendees} attending
                          </span>
                        </div>
                      </div>
                      <Button>Register</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>Top Contributors</CardTitle>
              </div>
              <CardDescription>Most active community members this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topMembers.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <Avatar>
                      <AvatarFallback>{member.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{member.reputation}</p>
                      <p className="text-xs text-muted-foreground">{member.posts} posts</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Be respectful and professional
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Share knowledge and help others
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  No spam or self-promotion
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Keep discussions relevant
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  Report inappropriate content
                </li>
              </ul>
              <Button variant="link" className="mt-4 px-0">
                Read Full Guidelines
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Community Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Members</span>
                  <span className="font-semibold">12,458</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discussions</span>
                  <span className="font-semibold">3,724</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Today</span>
                  <span className="font-semibold">847</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">New This Week</span>
                  <span className="font-semibold">156</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Community;
