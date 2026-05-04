'use client'

import { useEffect, useState, useCallback } from 'react'

interface MeetingTimerProps {
  meetingId: string
  startTime: string
  endTime: string
  status: string
  onDelete: (id: string) => void
  theme: string
}

export default function MeetingTimer({ 
  meetingId, 
  startTime, 
  endTime, 
  status, 
  onDelete,
  theme 
}: MeetingTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [timerType, setTimerType] = useState<'start' | 'end' | 'ended'>('start')

  const calculateTimeLeft = useCallback(() => {
    const now = new Date().getTime()
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()

    if (now < start) {
      // Meeting hasn't started yet - show countdown to start
      setTimerType('start')
      return Math.ceil((start - now) / 1000 / 60) // minutes
    } else if (now < end) {
      // Meeting is ongoing - show countdown to end
      setTimerType('end')
      return Math.ceil((end - now) / 1000 / 60) // minutes
    } else {
      // Meeting has ended
      setTimerType('ended')
      return 0
    }
  }, [startTime, endTime])

  useEffect(() => {
    // Initial calculation
    const now = new Date().getTime()
    const start = new Date(startTime).getTime()
    const end = new Date(endTime).getTime()
    
    const initial = calculateTimeLeft()
    setTimeLeft(initial)

    // If already ended, trigger delete immediately
    if (now >= end) {
      onDelete(meetingId)
      return
    }

    // Update every minute
    const interval = setInterval(() => {
      const currentNow = new Date().getTime()
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      // If timer reaches 0 and meeting ended, delete it
      if (currentNow >= end) {
        onDelete(meetingId)
        clearInterval(interval)
      }
    }, 60000) // update every minute

    return () => clearInterval(interval)
  }, [calculateTimeLeft, meetingId, onDelete, startTime, endTime])

  const getTimerStyles = () => {
    if (timerType === 'start') {
      return theme === 'dark' 
        ? 'text-yellow-400 font-semibold' 
        : 'text-yellow-600 font-semibold'
    } else if (timerType === 'end') {
      return theme === 'dark' 
        ? 'text-green-400 font-semibold' 
        : 'text-green-600 font-semibold'
    } else {
      return theme === 'dark' 
        ? 'text-red-400 font-semibold' 
        : 'text-red-600 font-semibold'
    }
  }

  const getTimerText = () => {
    if (timerType === 'start') {
      return `Starts in ${timeLeft} min`
    } else if (timerType === 'end') {
      return `Ends in ${timeLeft} min`
    } else {
      return 'Meeting ended'
    }
  }

  if (status === 'cancelled' || status === 'completed') {
    return (
      <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
        {status === 'cancelled' ? 'Cancelled' : 'Completed'}
      </span>
    )
  }

  return (
    <div className={`text-sm ${getTimerStyles()}`}>
      {getTimerText()}
    </div>
  )
}
