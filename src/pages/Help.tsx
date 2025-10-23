import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, BookOpen, Video, MessageCircle, Mail, ExternalLink } from 'lucide-react';

const Help = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const gettingStartedGuides = [
    {
      title: 'Creating Your First Event',
      description: 'Learn how to set up and publish your first event',
      link: '#'
    },
    {
      title: 'Finding the Right Suppliers',
      description: 'How to search and connect with suppliers',
      link: '#'
    },
    {
      title: 'Managing Your Profile',
      description: 'Set up your profile and preferences',
      link: '#'
    },
    {
      title: 'Understanding Pricing',
      description: 'Learn about our pricing plans and features',
      link: '#'
    }
  ];

  const videoTutorials = [
    {
      title: 'Platform Overview',
      duration: '5:30',
      thumbnail: 'https://via.placeholder.com/320x180',
      link: '#'
    },
    {
      title: 'Event Creation Walkthrough',
      duration: '8:15',
      thumbnail: 'https://via.placeholder.com/320x180',
      link: '#'
    },
    {
      title: 'Supplier Dashboard Tour',
      duration: '6:45',
      thumbnail: 'https://via.placeholder.com/320x180',
      link: '#'
    }
  ];

  const commonTopics = [
    { category: 'Account', count: 12 },
    { category: 'Events', count: 18 },
    { category: 'Suppliers', count: 15 },
    { category: 'Payments', count: 9 },
    { category: 'Security', count: 7 },
    { category: 'Troubleshooting', count: 14 }
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Help Center</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Find answers, guides, and support to help you succeed
        </p>

        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help articles, guides, and tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>
      </div>

      <Tabs defaultValue="guides" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guides">
            <BookOpen className="h-4 w-4 mr-2" />
            Guides
          </TabsTrigger>
          <TabsTrigger value="videos">
            <Video className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="topics">
            <Search className="h-4 w-4 mr-2" />
            Topics
          </TabsTrigger>
          <TabsTrigger value="contact">
            <MessageCircle className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started Guides</CardTitle>
              <CardDescription>
                Step-by-step guides to help you get up and running quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {gettingStartedGuides.map((guide, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-semibold mb-2">{guide.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{guide.description}</p>
                    <Button variant="ghost" size="sm" className="group">
                      Read Guide
                      <ExternalLink className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Popular Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'How to verify your account',
                  'Best practices for event planning',
                  'Managing supplier relationships',
                  'Understanding event analytics',
                  'Setting up payment methods'
                ].map((article, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded hover:bg-accent cursor-pointer"
                  >
                    <span>{article}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>
                Watch step-by-step video guides to master the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {videoTutorials.map((video, index) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="relative mb-3 rounded-lg overflow-hidden">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full aspect-video object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {video.title}
                    </h3>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Browse by Topic</CardTitle>
              <CardDescription>
                Explore help articles organized by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {commonTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="p-6 border rounded-lg hover:shadow-md transition-shadow cursor-pointer text-center"
                  >
                    <h3 className="font-semibold text-lg mb-2">{topic.category}</h3>
                    <p className="text-sm text-muted-foreground">{topic.count} articles</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <CardTitle>Live Chat Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get instant help from our support team during business hours.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Monday - Friday: 9:00 AM - 6:00 PM EST
                </p>
                <Button className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Start Live Chat
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Email Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Send us an email and we'll respond within 24 hours.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  support@eventplatform.com
                </p>
                <Button variant="outline" className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
              <CardDescription>
                Check out these additional resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View FAQ
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Join Community Forum
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Developer Documentation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Help;
