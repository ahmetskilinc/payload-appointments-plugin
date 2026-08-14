'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '../../../../components/ui/button';
import { cancelAppointment } from '../../actions/appointment';

interface CancelButtonProps {
  appointmentId: number | string;
  disabled?: boolean;
}

export function CancelButton({ appointmentId, disabled }: CancelButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCancel = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await cancelAppointment(appointmentId);

      if (result.success) {
        router.refresh();
      } else {
        setError(result.message);
      }
    } catch {
      setError('An error occurred while cancelling');
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (disabled) {
    return null;
  }

  if (showConfirm) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600 text-center">
          Are you sure you want to cancel this appointment?
        </p>
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            {error}
          </div>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
          >
            Keep Appointment
          </Button>
          <Button
            variant="destructive"
            className="flex-1 bg-red-600 hover:bg-red-700"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Cancelling...
              </span>
            ) : (
              'Yes, Cancel'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
      onClick={() => setShowConfirm(true)}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
      Cancel Appointment
    </Button>
  );
}

