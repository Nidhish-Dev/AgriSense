import React from 'react';
import Navbar from '@/components/Navbar';
import SensorData from '@/components/SensorData';
import SensorCharts from '@/components/SensorCharts';

function Page() {
  return (
    <>
      <Navbar />
      <div className="first h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/ab2.jpg')" }}>
        <SensorData />
      </div>
    </>
  );
}

export default Page;
