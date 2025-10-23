import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
}

const Blog = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Top 10 Tips for Planning a Successful Corporate Event',
      excerpt: 'Learn the essential strategies that event planners use to create memorable corporate experiences...',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      category: 'Event Planning',
      readTime: '5 min read'
    },
    {
      id: 2,
      title: 'How to Choose the Right Suppliers for Your Event',
      excerpt: 'A comprehensive guide to vetting and selecting the best suppliers for your event needs...',
      author: 'Michael Chen',
      date: '2024-01-10',
      category: 'Suppliers',
      readTime: '7 min read'
    },
    {
      id: 3,
      title: 'The Future of Hybrid Events: Trends to Watch',
      excerpt: 'Explore the latest trends in hybrid events and how technology is shaping the future of gatherings...',
      author: 'Emily Rodriguez',
      date: '2024-01-05',
      category: 'Industry Trends',
      readTime: '6 min read'
    },
    {
      id: 4,
      title: 'Budget Management: Making Every Dollar Count',
      excerpt: 'Expert tips on managing your event budget effectively while maintaining quality...',
      author: 'David Kim',
      date: '2023-12-28',
      category: 'Finance',
      readTime: '8 min read'
    },
    {
      id: 5,
      title: 'Building Strong Relationships with Event Suppliers',
      excerpt: 'Why supplier relationships matter and how to nurture them for long-term success...',
      author: 'Jessica Martinez',
      date: '2023-12-20',
      category: 'Relationships',
      readTime: '5 min read'
    },
    {
      id: 6,
      title: 'Sustainable Event Planning: A Complete Guide',
      excerpt: 'How to plan eco-friendly events that reduce environmental impact without compromising quality...',
      author: 'Alex Thompson',
      date: '2023-12-15',
      category: 'Sustainability',
      readTime: '10 min read'
    }
  ];

  const filteredPosts = blogPosts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Insights, tips, and updates from the world of event planning
        </p>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-xs text-muted-foreground">{post.readTime}</span>
              </div>
              <CardTitle className="line-clamp-2">{post.title}</CardTitle>
              <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(post.date).toLocaleDateString()}</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full group">
                Read More
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No articles found matching your search.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Stay Updated</CardTitle>
            <CardDescription>
              Subscribe to our newsletter for the latest articles and event planning tips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input placeholder="Enter your email" type="email" />
              <Button>Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Blog;
