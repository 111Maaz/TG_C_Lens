
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, TrendingUp, Map, BarChart3, Users, AlertTriangle } from 'lucide-react';

export const WelcomePage: React.FC = () => {
  const features = [
    {
      icon: <Map className="h-6 w-6 text-blue-600" />,
      title: "Interactive Crime Map",
      description: "Visualize crime data across Telangana districts with color-coded intensity markers"
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-green-600" />,
      title: "Statistical Analysis",
      description: "Comprehensive crime statistics and district-wise rankings for informed insights"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
      title: "Crime Trends",
      description: "Year-over-year crime trend analysis to identify patterns and changes"
    },
    {
      icon: <Users className="h-6 w-6 text-orange-600" />,
      title: "Demographics",
      description: "Population-based crime rate analysis for accurate per capita statistics"
    },
    {
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      title: "Safety Insights",
      description: "Identify safest districts and crime hotspots for better resource allocation"
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      title: "Real-time Data",
      description: "Up-to-date crime statistics from official Telangana Police records"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8">
          <div className="flex-1">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-blue-600">T•G Crime Lens</span>
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Comprehensive Crime Analytics Dashboard for Telangana State
            </p>
            <div className="flex items-center gap-4 text-lg">
              <span className="text-gray-700">Developed by</span>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
                <span className="font-semibold text-gray-900">Mohammed Maaz Ali</span>
              </div>
            </div>
            <div className="mt-3 text-gray-600">
              Student ID: <span className="font-mono">1604-22-737-</span>
              <span className="bg-yellow-200 px-1 rounded font-mono font-bold">101</span>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-2 shadow-2xl">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <div className="w-24 h-24 bg-gray-400 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">MA</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-3 rounded-full shadow-lg">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How This Dashboard Helps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    {feature.icon}
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-2xl p-8 shadow-lg border">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Explore Crime Data?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Navigate through comprehensive crime statistics, interactive maps, and detailed analytics 
            to gain insights into Telangana's crime landscape and public safety trends.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => window.location.href = '/#crime-map'}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              View Crime Map
            </button>
            <button 
              onClick={() => window.location.href = '/#crime-statistics'}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Explore Statistics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
