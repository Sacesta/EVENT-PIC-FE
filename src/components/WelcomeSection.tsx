import React from 'react';

export const WelcomeSection: React.FC = () => {
  return (
    <section 
      className="text-center space-y-6 mb-8"
      aria-label="Welcome section"
    >
      {/* Logo/Icon with gradient background */}
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-gradient-primary rounded-2xl shadow-glow transform rotate-6"></div>
        <div className="relative bg-white rounded-2xl w-full h-full flex items-center justify-center shadow-lg">
          <svg 
            className="w-10 h-10 text-primary" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2.5} 
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-3">
        <h1 className="text-2xl lg:text-3xl font-semibold text-foreground">
          Welcome to{' '}
          <span className="text-gradient-primary font-bold">PIC</span>
        </h1>
        <p className="text-muted-foreground text-sm lg:text-base leading-relaxed max-w-xs mx-auto">
          Your ultimate event planning companion. Create, manage, and celebrate memorable moments with ease.
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="flex justify-center gap-2 opacity-60">
        <div className="w-2 h-2 rounded-full bg-secondary"></div>
        <div className="w-2 h-2 rounded-full bg-accent"></div>
        <div className="w-2 h-2 rounded-full bg-secondary-green"></div>
      </div>
    </section>
  );
};
