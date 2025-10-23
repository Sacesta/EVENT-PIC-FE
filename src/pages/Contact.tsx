import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, MapPin, Phone, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(t('pages.contact.form.success'));
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('pages.contact.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('pages.contact.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t('pages.contact.form.title')}</CardTitle>
              <CardDescription>
                {t('pages.contact.form.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">{t('pages.contact.form.name')}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t('pages.contact.form.namePlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="email">{t('pages.contact.form.email')}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t('pages.contact.form.emailPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="subject">{t('pages.contact.form.subject')}</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder={t('pages.contact.form.subjectPlaceholder')}
                  />
                </div>
                <div>
                  <Label htmlFor="message">{t('pages.contact.form.message')}</Label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder={t('pages.contact.form.messagePlaceholder')}
                    rows={5}
                  />
                </div>
                <Button type="submit" className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {t('pages.contact.form.send')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>{t('pages.contact.info.email.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('pages.contact.info.email.address')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                <CardTitle>{t('pages.contact.info.phone.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t('pages.contact.info.phone.number')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('pages.contact.info.phone.hours')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle>{t('pages.contact.info.location.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {t('pages.contact.info.location.address')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('pages.contact.info.businessHours.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pages.contact.info.businessHours.weekdays')}</span>
                  <span>{t('pages.contact.info.businessHours.weekdaysHours')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pages.contact.info.businessHours.friday')}</span>
                  <span>{t('pages.contact.info.businessHours.fridayHours')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('pages.contact.info.businessHours.saturday')}</span>
                  <span>{t('pages.contact.info.businessHours.saturdayHours')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contact;
