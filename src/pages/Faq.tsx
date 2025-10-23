import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const Faq = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FaqItem[] = [
    {
      question: 'How do I create an account?',
      answer: 'To create an account, click the "Sign Up" button in the navigation bar. Choose your role (Producer or Supplier), fill in your details, and verify your email address. Once verified, you can complete your profile and start using the platform.',
      category: 'account'
    },
    {
      question: 'What is the difference between a Producer and Supplier account?',
      answer: 'Producers are event organizers who create and manage events, while Suppliers provide services or products for events. Producers can create events and search for suppliers, while Suppliers can showcase their services and respond to event opportunities.',
      category: 'account'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link. Follow the instructions in the email to set a new password.',
      category: 'account'
    },
    {
      question: 'How do I create an event?',
      answer: 'Navigate to your Producer Dashboard and click "Create Event". Follow the multi-step form to add event details, location, dates, budget, and requirements. You can save drafts and publish when ready.',
      category: 'events'
    },
    {
      question: 'Can I edit an event after publishing?',
      answer: 'Yes, you can edit most event details even after publishing. Go to your event page and click "Edit Event". Changes will be updated immediately and visible to suppliers who have access.',
      category: 'events'
    },
    {
      question: 'How do I find suppliers for my event?',
      answer: 'Use the "Browse Suppliers" page to search and filter suppliers by category, location, rating, and more. You can view supplier profiles, portfolios, and reviews before contacting them.',
      category: 'events'
    },
    {
      question: 'How does the chat system work?',
      answer: 'Once you connect with a supplier or event, you can use the built-in chat system to communicate in real-time. Access chats from the "Messages" section in your dashboard or from individual event/supplier pages.',
      category: 'communication'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit cards (Visa, MasterCard, American Express), debit cards, and PayPal. All payments are processed securely through our payment partners.',
      category: 'billing'
    },
    {
      question: 'What are the subscription plans?',
      answer: 'We offer Free, Professional, and Enterprise plans. The Free plan includes basic features, while paid plans offer advanced analytics, unlimited events, priority support, and more. Visit our pricing page for detailed comparisons.',
      category: 'billing'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time from your account settings. You\'ll continue to have access to premium features until the end of your billing period.',
      category: 'billing'
    },
    {
      question: 'How do I verify my supplier account?',
      answer: 'To get verified, complete your profile with business details, upload required documents (business license, insurance, etc.), and submit for review. Our team typically reviews applications within 2-3 business days.',
      category: 'suppliers'
    },
    {
      question: 'How can I improve my supplier profile visibility?',
      answer: 'Complete your profile 100%, add high-quality photos and videos, collect reviews from past clients, respond quickly to inquiries, and maintain high ratings. Verified suppliers also rank higher in search results.',
      category: 'suppliers'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use industry-standard encryption (SSL/TLS) to protect your data in transit and at rest. We comply with GDPR and other data protection regulations. We never share your personal information without consent.',
      category: 'security'
    },
    {
      question: 'How do you handle privacy?',
      answer: 'We take privacy seriously and only collect data necessary to provide our services. You have full control over your data and can request access, correction, or deletion at any time. See our Privacy Policy for details.',
      category: 'security'
    },
    {
      question: 'What should I do if I encounter a problem?',
      answer: 'If you experience any issues, first check our Help Center and FAQ. If you can\'t find a solution, contact our support team via email (support@eventplatform.com) or live chat during business hours.',
      category: 'support'
    },
    {
      question: 'Do you offer customer support?',
      answer: 'Yes! We offer email support (24/7) and live chat support (Monday-Friday, 9 AM - 6 PM EST). Premium subscribers get priority support with faster response times.',
      category: 'support'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions' },
    { id: 'account', label: 'Account' },
    { id: 'events', label: 'Events' },
    { id: 'suppliers', label: 'Suppliers' },
    { id: 'communication', label: 'Communication' },
    { id: 'billing', label: 'Billing' },
    { id: 'security', label: 'Security' },
    { id: 'support', label: 'Support' }
  ];

  const filteredFaqs = (category: string) => {
    let filtered = category === 'all' ? faqs : faqs.filter(faq => faq.category === category);

    if (searchQuery) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Find quick answers to common questions about our platform
        </p>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          {categories.map(cat => (
            <TabsTrigger key={cat.id} value={cat.id} className="text-xs lg:text-sm">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardContent className="pt-6">
                {filteredFaqs(category.id).length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs(category.id).map((faq, index) => (
                      <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No questions found matching your search.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex gap-3 justify-center">
              <a href="/contact">
                <button className="px-4 py-2 border rounded-md hover:bg-accent">
                  Contact Support
                </button>
              </a>
              <a href="/help">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                  Visit Help Center
                </button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Faq;
