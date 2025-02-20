'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'; 
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app } from '../lib/firebase';

const SensorCharts = () => {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const fetchSensorData = async () => {
      const firestore = getFirestore(app);
      const sensorLogsRef = collection(firestore, "sensor_logs");
      const querySnapshot = await getDocs(sensorLogsRef);

      if (!querySnapshot.empty) {
        const data: any[] = [];
        const labelArray: string[] = [];

        querySnapshot.forEach((doc) => {
          const docData = doc.data();
          const timestamp = docData.timestamp;

          data.push({
            temperature: docData.temperature,
            humidity: docData.humidity,
            soil_moisture: docData.soil_moisture,
            mq135_ppm: docData.mq135_ppm,
          });

          labelArray.push(timestamp);
        });

        setSensorData(data);
        setLabels(labelArray);
      } else {
        console.log('No sensor logs found in Firestore');
      }
    };

    fetchSensorData();
  }, []);

  const chartData = sensorData.map((data, index) => ({
    timestamp: labels[index],
    temperature: data.temperature,
    humidity: data.humidity,
    soil_moisture: data.soil_moisture,
    mq135_ppm: data.mq135_ppm,
  }));

  return (
    <div className="flex flex-col justify-center items-center p-4 pt-20 sm:p-10 bg-gradient-to-r">
      <div className="bg-white/10 p-6 sm:p-8 rounded-xl shadow-2xl backdrop-blur-lg w-full max-w-7xl mx-auto mt-6 sm:mt-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center text-white">Sensor Data</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
          <div className="bg-white/60 p-4 rounded-lg shadow-md backdrop-blur-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Temperature (°C)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" stroke="#8884d8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#8884d8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ddd' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="temperature" stroke="#ff6361" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/60 p-4 rounded-lg shadow-md backdrop-blur-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Humidity (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" stroke="#8884d8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#8884d8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ddd' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="humidity" stroke="#00c3a2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/60 p-4 rounded-lg shadow-md backdrop-blur-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Soil Moisture (%)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" stroke="#8884d8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#8884d8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ddd' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="soil_moisture" stroke="#9b59b6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white/60 p-4 rounded-lg shadow-md backdrop-blur-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">VOC PPM</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="5 5" stroke="#e0e0e0" />
                <XAxis dataKey="timestamp" stroke="#8884d8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#8884d8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '5px', border: '1px solid #ddd' }} />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line type="monotone" dataKey="mq135_ppm" stroke="#ff9f40" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorCharts;
