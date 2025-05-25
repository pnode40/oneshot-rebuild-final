import React, { useState, useEffect } from 'react';
import { 
  FaBrain, 
  FaLightbulb, 
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaSync,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaStar,
  FaChartLine
} from 'react-icons/fa';
import { 
  MdTrendingUp,
  MdAutoGraph,
  MdRecommend
} from 'react-icons/md';

interface Insight {
  id: number;
  insightType: 'profile_optimization' | 'recruiter_targeting' | 'market_trend' | 'performance_improvement';
  targetType: 'user' | 'profile' | 'system';
  targetId?: number;
  title: string;
  description: string;
  recommendations: Array<{
    action: string;
    impact: 'low' | 'medium' | 'high';
    effort: 'low' | 'medium' | 'high';
  }>;
  priority: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  dataPoints?: any;
  isRead?: boolean;
  isActioned?: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface AnalyticsInsightsProps {
  userRole?: string;
  userId?: number;
  onRefresh?: () => void;
}

export const AnalyticsInsights: React.FC<AnalyticsInsightsProps> = ({ 
  userRole = 'athlete', 
  userId,
  onRefresh 
}) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'high_priority'>('all');
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/insights', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch insights: ${response.status}`);
      }

      const result = await response.json();
      setInsights(result.data.insights || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const handleRefresh = () => {
    fetchInsights();
    onRefresh?.();
  };

  const markAsRead = async (insightId: number) => {
    try {
      await fetch(`/api/analytics/insights/${insightId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActioned: false }),
      });

      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, isRead: true } : insight
      ));
    } catch (err) {
      console.error('Failed to mark insight as read:', err);
    }
  };

  const markAsActioned = async (insightId: number) => {
    try {
      await fetch(`/api/analytics/insights/${insightId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActioned: true }),
      });

      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, isActioned: true, isRead: true } : insight
      ));
    } catch (err) {
      console.error('Failed to mark insight as actioned:', err);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'profile_optimization': return FaLightbulb;
      case 'recruiter_targeting': return MdRecommend;
      case 'market_trend': return MdTrendingUp;
      case 'performance_improvement': return FaChartLine;
      default: return FaBrain;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredInsights = insights.filter(insight => {
    switch (filter) {
      case 'unread': return !insight.isRead;
      case 'high_priority': return insight.priority === 'high' || insight.priority === 'critical';
      default: return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSync className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-lg text-gray-600">Loading AI insights...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Insights</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaBrain className="h-8 w-8 text-purple-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">AI-Powered Insights</h2>
            <p className="text-sm text-gray-600">
              Machine learning recommendations to optimize your performance
            </p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center text-purple-600 hover:text-purple-800"
        >
          <FaSync className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <div className="flex space-x-2">
          {[
            { key: 'all', label: 'All Insights' },
            { key: 'unread', label: 'Unread' },
            { key: 'high_priority', label: 'High Priority' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`px-3 py-1 text-sm rounded-md ${
                filter === key
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <div className="text-center py-12">
          <FaBrain className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No insights available</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'AI is analyzing your data to generate personalized insights.'
              : `No insights match the current filter: ${filter.replace('_', ' ')}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInsights.map((insight) => {
            const Icon = getInsightIcon(insight.insightType);
            
            return (
              <div
                key={insight.id}
                className={`bg-white rounded-lg shadow border-l-4 ${
                  insight.priority === 'critical' ? 'border-red-500' :
                  insight.priority === 'high' ? 'border-orange-500' :
                  insight.priority === 'medium' ? 'border-yellow-500' : 'border-blue-500'
                } ${!insight.isRead ? 'ring-2 ring-purple-200' : ''}`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                          {!insight.isRead && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              New
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-4">{insight.description}</p>
                        
                        {/* Recommendations */}
                        {insight.recommendations && insight.recommendations.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center">
                              <FaLightbulb className="h-4 w-4 text-yellow-500 mr-2" />
                              Recommended Actions
                            </h4>
                            <div className="space-y-2">
                              {insight.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <FaArrowRight className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{rec.action}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getImpactColor(rec.impact)}`}>
                                      {rec.impact} impact
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getEffortColor(rec.effort)}`}>
                                      {rec.effort} effort
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Confidence and metadata */}
                        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span>Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                            <span>•</span>
                            <span>{new Date(insight.createdAt).toLocaleDateString()}</span>
                            {insight.expiresAt && (
                              <>
                                <span>•</span>
                                <span>Expires: {new Date(insight.expiresAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-1">
                              <div 
                                className="bg-purple-500 h-1 rounded-full" 
                                style={{ width: `${insight.confidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2">
                      {!insight.isRead && (
                        <button
                          onClick={() => markAsRead(insight.id)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEye className="h-3 w-3 mr-1" />
                          Mark Read
                        </button>
                      )}
                      {!insight.isActioned && (
                        <button
                          onClick={() => markAsActioned(insight.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                        >
                          <FaCheckCircle className="h-3 w-3 mr-1" />
                          Mark Done
                        </button>
                      )}
                      {insight.isActioned && (
                        <span className="inline-flex items-center px-3 py-1 text-sm text-green-700 bg-green-100 rounded-md">
                          <FaCheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {insights.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Insights Summary</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{insights.length}</div>
              <div className="text-sm text-gray-500">Total Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {insights.filter(i => !i.isRead).length}
              </div>
              <div className="text-sm text-gray-500">Unread</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {insights.filter(i => i.priority === 'high' || i.priority === 'critical').length}
              </div>
              <div className="text-sm text-gray-500">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.isActioned).length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 