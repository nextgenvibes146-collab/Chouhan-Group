import React, { useState } from 'react';
import { MapPinIcon } from './Icons';

type AttendanceStatus = 'NotClockedIn' | 'ClockingIn' | 'ClockedIn' | 'Error';

const AttendanceCard: React.FC = () => {
    const [status, setStatus] = useState<AttendanceStatus>('NotClockedIn');
    const [clockInTime, setClockInTime] = useState<Date | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleClockIn = () => {
        setStatus('ClockingIn');
        setLocation('Fetching location...');
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                setClockInTime(new Date());
                setStatus('ClockedIn');
            },
            (err) => {
                console.error(err);
                setError('Could not get location. Please enable permissions.');
                setLocation(null);
                setStatus('Error');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'NotClockedIn':
                return <p className="text-sm text-text-secondary">You are not clocked in.</p>;
            case 'ClockingIn':
                 return <p className="text-sm text-text-secondary animate-pulse">Clocking in...</p>;
            case 'ClockedIn':
                return (
                    <div>
                        <p className="text-sm font-semibold text-green-600">
                            Clocked in at: {clockInTime?.toLocaleTimeString()}
                        </p>
                        <p className="text-xs text-text-secondary flex items-center mt-1">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {location}
                        </p>
                    </div>
                );
            case 'Error':
                return <p className="text-sm text-red-500">{error}</p>;
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Attendance</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                    {getStatusMessage()}
                    <button
                        onClick={handleClockIn}
                        disabled={status === 'ClockedIn' || status === 'ClockingIn'}
                        className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                    >
                       {status === 'ClockedIn' ? 'Clocked In' : 'Clock In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCard;