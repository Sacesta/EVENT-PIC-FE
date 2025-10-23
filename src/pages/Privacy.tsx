import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: January 15, 2024</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground">
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
                  you use our event management platform. Please read this privacy policy carefully. If you do not
                  agree with the terms of this privacy policy, please do not access the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="text-muted-foreground mb-3">
                  We collect information that you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Personal identification information (name, email address, phone number)</li>
                  <li>Business information (company name, business address, tax information)</li>
                  <li>Account credentials (username, password)</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                  <li>Event details and preferences</li>
                  <li>Communications between users on the platform</li>
                  <li>Profile photos and business logos</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">3. Automatically Collected Information</h2>
                <p className="text-muted-foreground mb-3">
                  When you access our platform, we automatically collect certain information, including:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Log data (IP address, browser type, operating system)</li>
                  <li>Device information (device type, unique device identifiers)</li>
                  <li>Usage data (pages visited, time spent, features used)</li>
                  <li>Location information (if you grant permission)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">4. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-3">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process transactions and send related information</li>
                  <li>Send technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Facilitate connections between event producers and suppliers</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                  <li>Detect, prevent, and address technical issues and fraudulent activity</li>
                  <li>Personalize and improve user experience</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">5. Information Sharing</h2>
                <p className="text-muted-foreground mb-3">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>With other users when you engage in transactions through the platform</li>
                  <li>With service providers who perform services on our behalf</li>
                  <li>With business partners for joint offerings or promotions (with your consent)</li>
                  <li>In response to legal requests or to protect rights and safety</li>
                  <li>In connection with a merger, sale, or acquisition of our business</li>
                  <li>With your explicit consent for other purposes</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  We do not sell your personal information to third parties for their marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">6. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational security measures to protect your personal
                  information. However, no method of transmission over the Internet or electronic storage is 100%
                  secure. While we strive to use commercially acceptable means to protect your information, we
                  cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">7. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as necessary to fulfill the purposes outlined in
                  this Privacy Policy, unless a longer retention period is required or permitted by law. When we no
                  longer need your information, we will securely delete or anonymize it.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">8. Your Rights</h2>
                <p className="text-muted-foreground mb-3">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your information</li>
                  <li>Object to or restrict processing of your information</li>
                  <li>Data portability</li>
                  <li>Withdraw consent at any time</li>
                  <li>Lodge a complaint with a supervisory authority</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">9. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our platform and hold
                  certain information. You can instruct your browser to refuse all cookies or to indicate when a
                  cookie is being sent. For more information, please see our Cookie Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">10. Third-Party Links</h2>
                <p className="text-muted-foreground">
                  Our platform may contain links to third-party websites. We are not responsible for the privacy
                  practices of these external sites. We encourage you to review the privacy policies of any
                  third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">11. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our platform is not intended for children under 18 years of age. We do not knowingly collect
                  personal information from children. If you believe we have collected information from a child,
                  please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">12. International Data Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your country of
                  residence. We ensure appropriate safeguards are in place to protect your information in
                  accordance with this Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">13. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                  the new Privacy Policy on this page and updating the "Last updated" date. You are advised to
                  review this Privacy Policy periodically for any changes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-3">14. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="text-muted-foreground mt-2">
                  Email: privacy@eventplatform.com<br />
                  Address: 123 Event Street, Suite 456, San Francisco, CA 94102
                </p>
              </section>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacy;
