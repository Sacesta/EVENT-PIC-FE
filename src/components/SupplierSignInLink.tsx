import React from 'react';
import { Link } from 'react-router-dom';

export const SupplierSignInLink: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-3">
      <Link to="/signin">
        <button 
          className="text-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus:outline-none rounded-lg p-2 relative group"
          aria-label="Sign in"
        >
          <span className="relative">
            Sign In
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
          </span>
        </button>
      </Link>
      
      <div className="text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link 
          to="/signup"
          className="text-accent hover:text-accent/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
        >
          Sign up here
        </Link>
      </div>
    </div>
  );
};
