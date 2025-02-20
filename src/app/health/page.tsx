import React from 'react'
import Navbar from '@/components/Navbar'
import HealthPrediction from "@/components/HealthPrediction";

function page() {
  return (
    <div>
      <Navbar />
      <div className="first h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/b2.jpg')" }}>
        <HealthPrediction />
      </div>
    </div>
  )
}

export default page
