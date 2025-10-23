import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{t('pages.about.title')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('pages.about.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              <CardTitle>{t('pages.about.mission.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('pages.about.mission.description')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <CardTitle>{t('pages.about.vision.title')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {t('pages.about.vision.description')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle>{t('pages.about.story.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {t('pages.about.story.paragraph1')}
          </p>
          <p className="text-muted-foreground">
            {t('pages.about.story.paragraph2')}
          </p>
          <p className="text-muted-foreground">
            {t('pages.about.story.paragraph3')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <CardTitle>{t('pages.about.values.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>{t('pages.about.values.quality.title')}:</strong> {t('pages.about.values.quality.description')}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>{t('pages.about.values.transparency.title')}:</strong> {t('pages.about.values.transparency.description')}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>{t('pages.about.values.innovation.title')}:</strong> {t('pages.about.values.innovation.description')}
              </div>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <div>
                <strong>{t('pages.about.values.community.title')}:</strong> {t('pages.about.values.community.description')}
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default About;
