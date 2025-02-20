'use client';

import { useEffect, useState } from 'react';
import { database, ref, get } from '../lib/firebase';

interface SensorDataState {
  humidity: number | null;
  mq135_ppm: number | null;
  soil_moisture: number | null;
  temperature: number | null;
}

const SensorData: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorDataState>({
    humidity: null,
    mq135_ppm: null,
    soil_moisture: null,
    temperature: null,
  });

  useEffect(() => {
    const fetchSensorData = async () => {
      const sensorRef = ref(database, 'sensor');

      try {
        const snapshot = await get(sensorRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setSensorData({
            humidity: data.humidity,
            mq135_ppm: data.mq135_ppm,
            soil_moisture: data.soil_moisture,
            temperature: data.temperature,
          });

          // Check the threshold conditions for triggering an email alert
          if (data.humidity < 30 || data.humidity > 80 || data.mq135_ppm < 0.1 || data.mq135_ppm > 2) {
            sendEmailAlert(data.humidity, data.mq135_ppm, data.soil_moisture, data.temperature);
          }
        } else {
          console.log('No data available');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchSensorData();

    const intervalId = setInterval(() => {
      fetchSensorData();
    }, 1000); // Fetch data every second

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const sendEmailAlert = async (humidity: number | null, mq135_ppm: number | null, soil_moisture: number | null, temperature: number | null) => {
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          humidity,
          mq135_ppm,
          soil_moisture,
          temperature,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Email sent successfully:', result.message);
      } else {
        console.error('Error sending email:', result.error);
      }
    } catch (error) {
      console.error('Error calling the email API:', error);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="bg-white/30 p-8 rounded-xl shadow-lg backdrop-blur-lg w-full max-w-4xl mx-auto mt-6 sm:mt-12">
        <h1 className="text-3xl font-semibold text-center text-white mb-6">AgriSense</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex justify-between items-center p-4 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out hover:bg-white/40 hover:shadow-xl">
            <span className="text-lg font-medium text-gray-700">Humidity</span>
            <span className="text-lg font-semibold text-black">{sensorData.humidity ?? '--'} %</span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out hover:bg-white/40 hover:shadow-xl">
            <span className="text-lg font-medium text-gray-700">VOC PPM</span>
            <span className="text-lg font-semibold text-black">{sensorData.mq135_ppm ?? '--'}</span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out hover:bg-white/40 hover:shadow-xl">
            <span className="text-lg font-medium text-gray-700">Soil Moisture</span>
            <span className="text-lg font-semibold text-black">{sensorData.soil_moisture ?? '--'} %</span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-lg shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out hover:bg-white/40 hover:shadow-xl">
            <span className="text-lg font-medium text-gray-700">Temperature</span>
            <span className="text-lg font-semibold text-black">{sensorData.temperature ?? '--'} °C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorData;
