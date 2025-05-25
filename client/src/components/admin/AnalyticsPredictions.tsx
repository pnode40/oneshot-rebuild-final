import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { 
  FaRocket, 
  FaSync,
  FaBrain,
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaLightbulb,
  FaArrowUp,
  FaArrowDown,
  FaEquals,
  FaExclamationTriangle
} from 'react-icons/fa';
import { 
  MdAutoGraph,
  MdTrendingUp,
  MdAnalytics,
  MdInsights
} from 'react-icons/md';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PredictionData {
  engagementForecasts: {
    sevenDay: { value: number; confidence: number; trend: 'up' | 'down' | 'stable' };
    thirtyDay: { value: number; confidence: number; trend: 'up' | 'down' | 'stable' };
    ninetyDay: { value: number; confidence: number; trend: 'up' | 'down' | 'stable' };
  };
  profileOptimization: {
    suggestions: Array<{
      id: string;
      category: string;
      suggestion: string;
      impact: 'high' | 'medium' | 'low';
      effort: 'high' | 'medium' | 'low';
      confidence: number;
      estimatedImprovement: number;
    }>;
  };
  recruiterInterest: {
    likelihood: number;
    seasonalTrends: Array<{ month: string; probability: number }>;
    geographicInsights: Array<{ region: string; interest: number; schools: number }>;
    sportSpecific: Array<{ position: string; demand: number; competition: number }>;
  };
  performanceRecommendations: {
    athletic: Array<{
      category: string;
      recommendation: string;
      priority: 'high' | 'medium' | 'low';
      timeframe: string;
      expectedGain: string;
    }>;
    training: Array<{
      focus: string;
      description: string;
      frequency: string;
      duration: string;
      difficulty: 'beginner' | 'intermediate' | 'advanced';
    }>;
  };
}

const AnalyticsPredictions: React.FC = () => {
  const [data, setData] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'engagement' | 'optimization' | 'recruiting' | 'performance'>('engagement');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchPredictionData();
  }, [timeRange]);

  const fetchPredictionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, use sample data since the backend predictions endpoint may not be fully implemented
      const sampleData: PredictionData = {
        engagementForecasts: {
          sevenDay: { value: 78, confidence: 85, trend: 'up' },
          thirtyDay: { value: 82, confidence: 78, trend: 'up' },
          ninetyDay: { value: 75, confidence: 65, trend: 'stable' }
        },
        profileOptimization: {
          suggestions: [
            {
              id: '1',
              category: 'Profile Photo',
              suggestion: 'Add action shots from recent games to increase engagement by 25%',
              impact: 'high',
              effort: 'low',
              confidence: 92,
              estimatedImprovement: 25
            },
            {
              id: '2',
              category: 'Video Content',
              suggestion: 'Upload highlight reel from championship game',
              impact: 'high',
              effort: 'medium',
              confidence: 88,
              estimatedImprovement: 35
            },
            {
              id: '3',
              category: 'Academic Info',
              suggestion: 'Update GPA and add recent transcript',
              impact: 'medium',
              effort: 'low',
              confidence: 95,
              estimatedImprovement: 15
            },
            {
              id: '4',
              category: 'Athletic Stats',
              suggestion: 'Add recent 40-yard dash and bench press numbers',
              impact: 'medium',
              effort: 'low',
              confidence: 90,
              estimatedImprovement: 20
            }
          ]
        },
        recruiterInterest: {
          likelihood: 73,
          seasonalTrends: [
            { month: 'Jan', probability: 45 },
            { month: 'Feb', probability: 52 },
            { month: 'Mar', probability: 68 },
            { month: 'Apr', probability: 75 },
            { month: 'May', probability: 82 },
            { month: 'Jun', probability: 78 },
            { month: 'Jul', probability: 65 },
            { month: 'Aug', probability: 58 },
            { month: 'Sep', probability: 72 },
            { month: 'Oct', probability: 85 },
            { month: 'Nov', probability: 90 },
            { month: 'Dec', probability: 55 }
          ],
          geographicInsights: [
            { region: 'Southeast', interest: 85, schools: 24 },
            { region: 'Southwest', interest: 72, schools: 18 },
            { region: 'Midwest', interest: 68, schools: 15 },
            { region: 'Northeast', interest: 61, schools: 12 },
            { region: 'West Coast', interest: 58, schools: 10 }
          ],
          sportSpecific: [
            { position: 'Quarterback', demand: 92, competition: 78 },
            { position: 'Wide Receiver', demand: 85, competition: 85 },
            { position: 'Running Back', demand: 75, competition: 90 },
            { position: 'Linebacker', demand: 80, competition: 72 }
          ]
        },
        performanceRecommendations: {
          athletic: [
            {
              category: 'Speed Training',
              recommendation: 'Focus on acceleration drills to improve 40-yard dash time',
              priority: 'high',
              timeframe: '6-8 weeks',
              expectedGain: '0.2-0.3 seconds'
            },
            {
              category: 'Strength Training',
              recommendation: 'Increase bench press and squat numbers for better recruiting metrics',
              priority: 'medium',
              timeframe: '8-12 weeks',
              expectedGain: '15-25 lbs'
            },
            {
              category: 'Agility',
              recommendation: 'Improve cone drill times with lateral movement training',
              priority: 'medium',
              timeframe: '4-6 weeks',
              expectedGain: '0.1-0.2 seconds'
            }
          ],
          training: [
            {
              focus: 'Sprint Mechanics',
              description: 'Work on proper running form and acceleration technique',
              frequency: '3x per week',
              duration: '45 minutes',
              difficulty: 'intermediate'
            },
            {
              focus: 'Position-Specific Skills',
              description: 'Quarterback footwork and throwing mechanics',
              frequency: '4x per week',
              duration: '60 minutes',
              difficulty: 'advanced'
            },
            {
              focus: 'Recovery & Mobility',
              description: 'Stretching, foam rolling, and injury prevention',
              frequency: 'Daily',
              duration: '20 minutes',
              difficulty: 'beginner'
            }
          ]
        }
      };

      setData(sampleData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prediction data');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <FaArrowUp className="text-green-500" />;
      case 'down': return <FaArrowDown className="text-red-500" />;
      case 'stable': return <FaEquals className="text-gray-500" />;
    }
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const engagementChartData = {
    labels: ['Current', '7 Days', '30 Days', '90 Days'],
    datasets: [
      {
        label: 'Predicted Engagement Score',
        data: [72, data?.engagementForecasts.sevenDay.value || 0, data?.engagementForecasts.thirtyDay.value || 0, data?.engagementForecasts.ninetyDay.value || 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Confidence Interval',
        data: [85, data?.engagementForecasts.sevenDay.confidence || 0, data?.engagementForecasts.thirtyDay.confidence || 0, data?.engagementForecasts.ninetyDay.confidence || 0],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        borderDash: [5, 5],
        fill: false,
      }
    ]
  };

  const seasonalTrendsData = {
    labels: data?.recruiterInterest.seasonalTrends.map(item => item.month) || [],
    datasets: [
      {
        label: 'Recruiter Interest Probability (%)',
        data: data?.recruiterInterest.seasonalTrends.map(item => item.probability) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-red-500 mr-3" />
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Predictions</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchPredictionData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaBrain className="text-2xl text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">ML Predictions & Forecasting</h2>
        </div>
        <button
          onClick={fetchPredictionData}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaSync className="w-4 h-4" />
          <span>Refresh Predictions</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'engagement', label: 'Engagement Forecasting', icon: FaChartLine },
            { id: 'optimization', label: 'Profile Optimization', icon: FaRocket },
            { id: 'recruiting', label: 'Recruiter Interest', icon: FaUsers },
            { id: 'performance', label: 'Performance Recommendations', icon: MdAutoGraph }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'engagement' && (
        <div className="space-y-6">
          {/* Engagement Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { period: '7 Days', data: data?.engagementForecasts.sevenDay, color: 'blue' },
              { period: '30 Days', data: data?.engagementForecasts.thirtyDay, color: 'green' },
              { period: '90 Days', data: data?.engagementForecasts.ninetyDay, color: 'purple' }
            ].map((forecast) => (
              <div key={forecast.period} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{forecast.period} Forecast</h3>
                  {forecast.data && getTrendIcon(forecast.data.trend)}
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Predicted Score</span>
                      <span className="text-2xl font-bold text-gray-900">{forecast.data?.value}%</span>
                    </div>
                    <div className={`w-full bg-gray-200 rounded-full h-2`}>
                      <div 
                        className={`bg-${forecast.color}-500 h-2 rounded-full`}
                        style={{ width: `${forecast.data?.value}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Confidence</span>
                      <span className="text-sm font-medium text-gray-700">{forecast.data?.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-gray-400 h-1 rounded-full"
                        style={{ width: `${forecast.data?.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Engagement Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Score Predictions</h3>
            <div className="h-64">
              <Line 
                data={engagementChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'optimization' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <FaLightbulb className="text-blue-600 mr-3" />
              <div>
                <h3 className="text-blue-800 font-medium">AI-Powered Profile Optimization</h3>
                <p className="text-blue-600 text-sm mt-1">
                  These suggestions are based on successful profiles and recruiter engagement patterns
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {data?.profileOptimization.suggestions.map((suggestion) => (
              <div key={suggestion.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{suggestion.category}</h3>
                    <p className="text-gray-600 text-sm mt-1">{suggestion.suggestion}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">+{suggestion.estimatedImprovement}%</div>
                    <div className="text-xs text-gray-500">Est. Improvement</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(suggestion.impact)}`}>
                      {suggestion.impact.toUpperCase()} Impact
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(suggestion.effort)}`}>
                      {suggestion.effort.toUpperCase()} Effort
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {suggestion.confidence}% confidence
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'recruiting' && (
        <div className="space-y-6">
          {/* Overall Likelihood */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Recruiter Interest Likelihood</h3>
              <div className="text-3xl font-bold text-blue-600">{data?.recruiterInterest.likelihood}%</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full"
                style={{ width: `${data?.recruiterInterest.likelihood}%` }}
              ></div>
            </div>
          </div>

          {/* Seasonal Trends Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seasonal Recruiting Trends</h3>
            <div className="h-64">
              <Bar 
                data={seasonalTrendsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Geographic and Sport-Specific Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Interest</h3>
              <div className="space-y-3">
                {data?.recruiterInterest.geographicInsights.map((region) => (
                  <div key={region.region} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{region.region}</div>
                      <div className="text-sm text-gray-600">{region.schools} schools</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${region.interest}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{region.interest}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Position-Specific Analysis</h3>
              <div className="space-y-3">
                {data?.recruiterInterest.sportSpecific.map((position) => (
                  <div key={position.position} className="border border-gray-100 rounded-lg p-3">
                    <div className="font-medium text-gray-900 mb-2">{position.position}</div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Demand</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full"
                              style={{ width: `${position.demand}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{position.demand}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Competition</div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-red-500 h-1 rounded-full"
                              style={{ width: `${position.competition}%` }}
                            ></div>
                          </div>
                          <span className="font-medium">{position.competition}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Athletic Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Athletic Performance Recommendations</h3>
              <div className="space-y-4">
                {data?.performanceRecommendations.athletic.map((rec, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{rec.category}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{rec.recommendation}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Timeframe:</span>
                        <span className="ml-1 font-medium">{rec.timeframe}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected Gain:</span>
                        <span className="ml-1 font-medium text-green-600">{rec.expectedGain}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Training Recommendations */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Program Recommendations</h3>
              <div className="space-y-4">
                {data?.performanceRecommendations.training.map((training, index) => (
                  <div key={index} className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{training.focus}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        training.difficulty === 'beginner' ? 'text-green-600 bg-green-50 border-green-200' :
                        training.difficulty === 'intermediate' ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                        'text-red-600 bg-red-50 border-red-200'
                      }`}>
                        {training.difficulty.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{training.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Frequency:</span>
                        <span className="ml-1 font-medium">{training.frequency}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Duration:</span>
                        <span className="ml-1 font-medium">{training.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPredictions; 