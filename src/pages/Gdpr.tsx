import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, Download, Trash2, Edit, Eye, AlertCircle } from 'lucide-react';

const Gdpr = () => {
  const { t } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">GDPR Compliance</h1>
        <p className="text-muted-foreground">
          Your data protection rights under the General Data Protection Regulation
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Your Data Rights</CardTitle>
            </div>
            <CardDescription>
              Under GDPR, you have comprehensive rights over your personal data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Eye className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Right to Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of your personal data we hold
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Edit className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Right to Rectification</h3>
                  <p className="text-sm text-muted-foreground">
                    Correct inaccurate or incomplete data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Trash2 className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Right to Erasure</h3>
                  <p className="text-sm text-muted-foreground">
                    Request deletion of your personal data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Download className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Right to Portability</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive your data in a portable format
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <AlertCircle className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Right to Object</h3>
                  <p className="text-sm text-muted-foreground">
                    Object to certain processing of your data
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h3 className="font-medium mb-1">Right to Restrict</h3>
                  <p className="text-sm text-muted-foreground">
                    Limit how we use your data
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download My Data
              </Button>
              <Button variant="outline" className="flex-1">
                <Edit className="mr-2 h-4 w-4" />
                Manage Preferences
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                <section>
                  <h2 className="text-2xl font-semibold mb-3">Overview</h2>
                  <p className="text-muted-foreground">
                    The General Data Protection Regulation (GDPR) is a comprehensive data protection law that came
                    into effect on May 25, 2018. It strengthens data protection for individuals within the European
                    Union (EU) and addresses the export of personal data outside the EU.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Our Commitment</h2>
                  <p className="text-muted-foreground mb-3">
                    We are committed to protecting your privacy and ensuring you have control over your personal
                    data. We comply with GDPR requirements by:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Processing data lawfully, fairly, and transparently</li>
                    <li>Collecting data only for specified, explicit purposes</li>
                    <li>Minimizing data collection to what is necessary</li>
                    <li>Keeping data accurate and up to date</li>
                    <li>Storing data only as long as necessary</li>
                    <li>Implementing appropriate security measures</li>
                    <li>Demonstrating accountability for data protection</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Legal Basis for Processing</h2>
                  <p className="text-muted-foreground mb-3">
                    We process your personal data based on the following legal grounds:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li><strong>Consent:</strong> You have given clear consent for us to process your data</li>
                    <li><strong>Contract:</strong> Processing is necessary to fulfill a contract with you</li>
                    <li><strong>Legal Obligation:</strong> We must process data to comply with the law</li>
                    <li><strong>Legitimate Interests:</strong> Processing is in our legitimate business interests</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Data We Collect</h2>
                  <p className="text-muted-foreground mb-3">
                    We collect and process the following categories of personal data:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Identity data (name, username, title)</li>
                    <li>Contact data (email address, phone number, address)</li>
                    <li>Account data (login credentials, preferences)</li>
                    <li>Transaction data (payment details, purchase history)</li>
                    <li>Technical data (IP address, browser type, device information)</li>
                    <li>Usage data (how you use our platform)</li>
                    <li>Marketing data (your communication preferences)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Your Rights in Detail</h2>

                  <div className="space-y-4 mt-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Right to Access</h3>
                      <p className="text-muted-foreground">
                        You have the right to request a copy of the personal data we hold about you. This is known
                        as a Subject Access Request (SAR). We will provide this information free of charge within
                        one month of your request.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Right to Rectification</h3>
                      <p className="text-muted-foreground">
                        If you believe any information we hold about you is inaccurate or incomplete, you have the
                        right to request correction. We will update your information promptly upon verification.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Right to Erasure (Right to be Forgotten)</h3>
                      <p className="text-muted-foreground">
                        You can request deletion of your personal data when there is no compelling reason for us
                        to continue processing it. This right is not absolute and may be limited by legal
                        requirements to retain certain data.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Right to Data Portability</h3>
                      <p className="text-muted-foreground">
                        You can request your personal data in a structured, commonly used, machine-readable format
                        and have it transmitted to another data controller.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Right to Object</h3>
                      <p className="text-muted-foreground">
                        You have the right to object to processing of your data for direct marketing purposes,
                        processing based on legitimate interests, or processing for research/statistical purposes.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Right to Restrict Processing</h3>
                      <p className="text-muted-foreground">
                        You can request that we limit the processing of your personal data in certain circumstances,
                        such as when you contest the accuracy of the data or object to processing.
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Data Protection Officer</h2>
                  <p className="text-muted-foreground">
                    We have appointed a Data Protection Officer (DPO) to oversee our GDPR compliance. You can
                    contact our DPO at:
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Email: dpo@eventplatform.com<br />
                    Address: Data Protection Officer, 123 Event Street, Suite 456, San Francisco, CA 94102
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Data Breaches</h2>
                  <p className="text-muted-foreground">
                    In the event of a data breach that poses a risk to your rights and freedoms, we will notify
                    the relevant supervisory authority within 72 hours and inform affected individuals without
                    undue delay.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">International Data Transfers</h2>
                  <p className="text-muted-foreground">
                    When we transfer your data outside the EEA, we ensure appropriate safeguards are in place,
                    such as Standard Contractual Clauses approved by the European Commission or transfers to
                    countries with adequate data protection decisions.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Making a Complaint</h2>
                  <p className="text-muted-foreground">
                    If you believe we have not handled your data properly, you have the right to lodge a complaint
                    with your local supervisory authority. However, we would appreciate the opportunity to address
                    your concerns first, so please contact us directly.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Exercising Your Rights</h2>
                  <p className="text-muted-foreground mb-3">
                    To exercise any of your GDPR rights:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Email us at privacy@eventplatform.com</li>
                    <li>Use the data management tools in your account settings</li>
                    <li>Contact our Data Protection Officer</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    We will respond to your request within one month. In complex cases, we may extend this period
                    by two additional months and will inform you of the extension.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-3">Updates to This Information</h2>
                  <p className="text-muted-foreground">
                    We may update this GDPR information from time to time. Any changes will be posted on this page
                    with an updated revision date.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Gdpr;
