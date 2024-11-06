/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const cities = [
  { name: 'Aqaba', country: 'JO' },
  { name: 'Amman', country: 'JO' },
  { name: 'Irbid', country: 'JO' },
  { name: 'Zarqa', country: 'JO' },
];

export default function PrayerTimesCountdownCity() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [nextPrayer, setNextPrayer] = useState('');

  useEffect(() => {
    const fetchPrayerTimes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${selectedCity.name}&country=${selectedCity.country}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch prayer times');
        }
        const data = await response.json();
        setPrayerTimes(data.data.timings);
        setLoading(false);
      } catch (err) {
        setError('An error occurred while fetching prayer times');
        setLoading(false);
      }
    };

    fetchPrayerTimes();
  }, [selectedCity]);

  useEffect(() => {
    if (prayerTimes) {
      const updateCountdown = () => {
        const now = new Date();
        const prayers = Object.entries(prayerTimes)
          .filter(([key]) =>
            ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key)
          )
          .map(([name, time]) => {
            const [hours, minutes] = time.split(':');
            const prayerTime = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              parseInt(hours),
              parseInt(minutes)
            );
            if (prayerTime < now) {
              prayerTime.setDate(prayerTime.getDate() + 1);
            }
            return { name, time: prayerTime };
          })
          .sort((a, b) => a.time.getTime() - b.time.getTime());

        const nextPrayer = prayers[0];
        setNextPrayer(nextPrayer.name);

        const diff = nextPrayer.time.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setCountdown(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };

      updateCountdown();
      const intervalId = setInterval(updateCountdown, 1000);

      return () => clearInterval(intervalId);
    }
  }, [prayerTimes]);

  const handleCityChange = (cityName) => {
    const newCity = cities.find((city) => city.name === cityName);
    if (newCity) {
      setSelectedCity(newCity);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Prayer Times
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select
            onValueChange={handleCityChange}
            defaultValue={selectedCity.name}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.name} value={city.name}>
                  {city.name}, {city.country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Next Prayer: {nextPrayer}
          </h2>
          <p className="text-3xl font-bold countdown-animation">{countdown}</p>
        </div>
        <div className="flex flex-wrap justify-between">
          {prayerTimes &&
            Object.entries(prayerTimes)
              .filter(([key]) =>
                ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key)
              )
              .map(([prayer, time]) => (
                <div key={prayer} className="w-1/2 p-2">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg">{prayer}</h3>
                      <p className="text-gray-600">{time}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
}
