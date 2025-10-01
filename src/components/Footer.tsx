import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Footer = () => {
  const { t } = useTranslation();
  
  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  const footerLinks = [
    {
      title: t('footer.company'),
      links: [
        { name: t('footer.aboutUs'), href: '/about' },
        { name: t('footer.contact'), href: '/contact' },
        { name: t('footer.careers'), href: '/careers' },
        { name: t('footer.blog'), href: '/blog' },
      ]
    },
    {
      title: t('footer.legal'),
      links: [
        { name: t('footer.terms'), href: '/terms' },
        { name: t('footer.privacy'), href: '/privacy' },
        { name: t('footer.cookies'), href: '/cookies' },
        { name: t('footer.gdpr'), href: '/gdpr' },
      ]
    },
    {
      title: t('footer.support'),
      links: [
        { name: t('footer.helpCenter'), href: '/help' },
        { name: t('footer.faq'), href: '/faq' },
        { name: t('footer.community'), href: '/community' },
        { name: t('footer.status'), href: '/status' },
      ]
    }
  ];

  const contactInfo = [
    { icon: Mail, text: 'hello@pic.com', href: 'mailto:hello@pic.com' },
    { icon: Phone, text: '+1 (555) 123-4567', href: 'tel:+15551234567' },
    { icon: MapPin, text: 'Tel Aviv, Israel', href: '#' },
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img src="/Icons_1.png" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg" alt="Pic Logo" />
              <h2 className="text-xl sm:text-2xl font-bold tracking-wider text-gradient-primary">PIC</h2>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              {t('footer.tagline')}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2 sm:gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center group"
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-200" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">{section.title}</h3>
              <ul className="space-y-1.5 sm:space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary text-xs sm:text-sm transition-colors duration-200 block py-0.5"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div className="space-y-3 sm:space-y-4 sm:col-span-2 lg:col-span-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">{t('footer.getInTouch')}</h3>
            <ul className="space-y-2 sm:space-y-3">
              {contactInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text}>
                    <a
                      href={item.href}
                      className="flex items-center gap-2 sm:gap-3 text-muted-foreground hover:text-primary text-xs sm:text-sm transition-colors duration-200 group py-0.5"
                    >
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
                      <span className="break-all sm:break-normal">{item.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
          <div className="text-muted-foreground text-xs sm:text-sm order-2 sm:order-1">
            © {new Date().getFullYear()} PIC. {t('footer.rights')}.
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm order-1 sm:order-2">
            <Link 
              to="/terms" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200 py-1"
            >
              {t('footer.terms')}
            </Link>
            <Link 
              to="/privacy" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200 py-1"
            >
              {t('footer.privacy')}
            </Link>
            <Link 
              to="/cookies" 
              className="text-muted-foreground hover:text-primary transition-colors duration-200 py-1"
            >
              {t('footer.cookies')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;