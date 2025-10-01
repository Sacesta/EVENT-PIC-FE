import React from 'react';

interface MobileContainerProps {
  children: React.ReactNode;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({ children }) => {
  return (
    <main className="max-w-none w-[349px] h-[757px] relative mx-auto my-0 max-md:max-w-[349px] max-md:w-full max-md:h-auto max-md:min-h-[757px] max-sm:max-w-screen-sm max-sm:w-full max-sm:box-border max-sm:px-4 max-sm:py-0">
      <div className="absolute inset-0 bg-[#D9D9D9]" />
      {children}
    </main>
  );
};
