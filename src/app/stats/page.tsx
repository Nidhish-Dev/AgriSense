import React from 'react';
import Navbar from '@/components/Navbar';
import SensorCharts from '@/components/SensorCharts';

function Page() {
  return (
    <>
      <Navbar />
      <div className="first h-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/ab1.jpg')" }}>
        <SensorCharts />
      </div>
    </>
  );
}

export default Page;
