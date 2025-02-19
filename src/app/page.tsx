import React from 'react';
import Navbar from '@/components/Navbar';

function Page() {
  return (
    <>
      <Navbar />
      <div className="first h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/b2.jpg')" }}>
        <div className="absolute inset-0 bg-black/40"></div> {/* Semi-transparent overlay for readability */}
        <div className="flex flex-col justify-center items-center h-full relative z-10 px-4">
          <p className='text-5xl font-bold text-center text-white mb-6 animate__animated animate__fadeIn animate__delay-1s'>
            AgriSense
          </p>
          <p className='text-white text-center max-w-3xl mx-auto text-xl px-6 animate__animated animate__fadeIn animate__delay-2s'>
            "Empowering farmers with real-time insights to detect and address plant stress for sustainable growth."
          </p>
        </div>
      </div>
    </>
  );
}

export default Page;
