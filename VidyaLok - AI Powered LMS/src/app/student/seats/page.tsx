'use client'

import React, { useState, useEffect } from 'react'
import { Armchair, Users, RefreshCw, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

// Client-side time display component to avoid hydration issues
function ClientTimeDisplay({ date }: { date: Date }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span>Loading...</span>
  }

  return <span>{date.toLocaleTimeString()}</span>
}

export default function SeatAvailabilityPage() {
  const [seatData, setSeatData] = useState({
    totalSeats: 100,
    occupiedSeats: 55,
    availableSeats: 45,
    lastUpdated: new Date()
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Mock user data
  const user = {
    name: "Rahul Sharma",
    role: "STUDENT" as const,
    studentId: "STU240001"
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock updated data
    const newOccupied = Math.floor(Math.random() * 100)
    setSeatData({
      totalSeats: 100,
      occupiedSeats: newOccupied,
      availableSeats: 100 - newOccupied,
      lastUpdated: new Date()
    })
    setIsRefreshing(false)
  }

  const occupancyPercentage = (seatData.occupiedSeats / seatData.totalSeats) * 100

  const getOccupancyColor = () => {
    if (occupancyPercentage >= 90) return 'text-red-600'
    if (occupancyPercentage >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getOccupancyStatus = () => {
    if (occupancyPercentage >= 90) return 'Very Busy'
    if (occupancyPercentage >= 70) return 'Moderately Busy'
    if (occupancyPercentage >= 30) return 'Available'
    return 'Mostly Empty'
  }

  // Generate seat grid for visualization
  const generateSeatGrid = () => {
    const seats = []
    for (let i = 0; i < seatData.totalSeats; i++) {
      seats.push({
        id: i + 1,
        isOccupied: i < seatData.occupiedSeats
      })
    }
    return seats
  }

  const seatGrid = generateSeatGrid()

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} />
      
      <div className="flex flex-1">
        <Sidebar userRole="STUDENT" />
        
        <main className="flex-1 ml-64 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Seat Availability</h1>
                <p className="text-gray-600">Real-time library seat occupancy information</p>
              </div>
              <Button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Seats</CardTitle>
                  <Armchair className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{seatData.totalSeats}</div>
                  <p className="text-xs text-muted-foreground">Library capacity</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Available Seats</CardTitle>
                  <Users className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{seatData.availableSeats}</div>
                  <p className="text-xs text-muted-foreground">Ready for use</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupied Seats</CardTitle>
                  <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{seatData.occupiedSeats}</div>
                  <p className="text-xs text-muted-foreground">Currently in use</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                  <Users className={`h-4 w-4 ${getOccupancyColor()}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${getOccupancyColor()}`}>
                    {occupancyPercentage.toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">{getOccupancyStatus()}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Seat Map Visualization */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Library Seat Map</CardTitle>
                  <CardDescription>
                    Visual representation of seat availability (Green: Available, Red: Occupied)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-10 gap-2">
                    {seatGrid.map((seat) => (
                      <div
                        key={seat.id}
                        className={`w-8 h-8 rounded flex items-center justify-center text-xs font-medium ${
                          seat.isOccupied
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : 'bg-green-100 text-green-800 border-green-200'
                        } border`}
                        title={`Seat ${seat.id} - ${seat.isOccupied ? 'Occupied' : 'Available'}`}
                      >
                        {seat.id}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex items-center justify-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                      <span className="text-sm text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
                      <span className="text-sm text-gray-600">Occupied</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Occupancy Trends and Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Occupancy Status</CardTitle>
                    <CardDescription>
                      Current library occupancy level
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getOccupancyColor()}`}>
                        {occupancyPercentage.toFixed(0)}%
                      </div>
                      <div className={`text-lg font-medium ${getOccupancyColor()}`}>
                        {getOccupancyStatus()}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full transition-all duration-500 ${
                          occupancyPercentage >= 90 ? 'bg-red-600' :
                          occupancyPercentage >= 70 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${occupancyPercentage}%` }}
                      />
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Available:</span>
                        <span className="font-medium">{seatData.availableSeats} seats</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Occupied:</span>
                        <span className="font-medium">{seatData.occupiedSeats} seats</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Last Updated</CardTitle>
                    <CardDescription>
                      Real-time data synchronization
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <ClientTimeDisplay date={seatData.lastUpdated} />
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Data is automatically updated every 2 minutes. Click refresh for the latest information.
                    </p>
                    
                    <Button 
                      onClick={handleRefresh} 
                      disabled={isRefreshing}
                      className="w-full"
                      size="sm"
                    >
                      {isRefreshing ? 'Updating...' : 'Refresh Now'}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Peak Hours</CardTitle>
                    <CardDescription>
                      Typical busy periods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Morning:</span>
                        <span className="text-yellow-600">9:00 AM - 11:00 AM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Afternoon:</span>
                        <span className="text-red-600">2:00 PM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Evening:</span>
                        <span className="text-green-600">6:00 PM - 8:00 PM</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
