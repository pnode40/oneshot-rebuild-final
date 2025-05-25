import React, { useState, useEffect } from 'react';
import { FaBrain, FaRobot, FaChartLine, FaExclamationTriangle, FaLightbulb, FaUsers, FaShieldAlt, FaEye } from 'react-icons/fa';
import { MdPsychology, MdTrendingUp, MdTrendingDown, MdReport } from 'react-icons/md';

interface SecurityIntelligenceReport {
  id: string;
  timestamp: Date;
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  systemHealthScore: number;
  threatDetections: ThreatDetection[];
  behavioralAnomalies: BehavioralAnomaly[];
  predictiveInsights: PredictiveInsight[];
  naturalLanguageSummary: string;
  recommendations: SecurityRecommendation[];
  trends: SecurityTrend[];
}

interface ThreatDetection {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  description: string;
  affectedUsers: string[];
  evidencePoints: string[];
  timeline: Date[];
  mitigationSteps: string[];
}

interface BehavioralAnomaly {
  userId: string;
  email: string;
  anomalyType: 'unusual_login_time' | 'new_location' | 'suspicious_activity' | 'access_pattern_change';
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
  baselineComparison: string;
  riskFactors: string[];
}

interface PredictiveInsight {
  type: 'threat_forecast' | 'vulnerability_prediction' | 'risk_trend';
  prediction: string;
  confidence: number;
  timeframe: string;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  preventiveActions: string[];
  actionPriority?: string;
  businessImpact?: string;
  implementation?: {
    difficulty: string;
    timeframe: string;
    resources: string[];
  };
  confidenceLevel?: string;
}

interface SecurityRecommendation {
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'policy' | 'technical' | 'user_education' | 'monitoring';
  title: string;
  description: string;
  implementation: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
}

interface SecurityTrend {
  metric: string;
  direction: 'improving' | 'declining' | 'stable';
  changePercentage: number;
  period: string;
  significance: 'low' | 'medium' | 'high';
  description: string;
}

interface HighRiskUser {
  userId: string;
  email: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastAnalysis: Date;
  threatCount: number;
  flagCount: number;
  summary: string;
}

interface NaturalLanguageSummary {
  executiveSummary: string;
  keyFindings: string[];
  riskAssessment: {
    level: string;
    score: number;
    description: string;
  };
  actionableInsights: string[];
  trendAnalysis: string;
  recommendations: {
    immediate: SecurityRecommendation[];
    shortTerm: SecurityRecommendation[];
    longTerm: SecurityRecommendation[];
  };
  fullNarrativeSummary: string;
}

export const AISecurityIntelligence: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // AI Intelligence Data
  const [intelligenceReport, setIntelligenceReport] = useState<SecurityIntelligenceReport | null>(null);
  const [highRiskUsers, setHighRiskUsers] = useState<HighRiskUser[]>([]);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsight[]>([]);
  const [naturalLanguageSummary, setNaturalLanguageSummary] = useState<NaturalLanguageSummary | null>(null);
  const [analysisInProgress, setAnalysisInProgress] = useState(false);

  const tabs = [
    { id: 'overview', label: 'AI Overview', icon: FaBrain },
    { id: 'threats', label: 'Threat Detection', icon: FaExclamationTriangle },
    { id: 'behavioral', label: 'Behavioral Analysis', icon: MdPsychology },
    { id: 'predictions', label: 'Predictive Insights', icon: FaLightbulb },
    { id: 'summary', label: 'AI Summary', icon: MdReport },
    { id: 'users', label: 'High-Risk Users', icon: FaUsers }
  ];

  useEffect(() => {
    loadAIIntelligenceData();
  }, []);

  const loadAIIntelligenceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Load all AI intelligence data
      await Promise.all([
        loadIntelligenceReport(token),
        loadHighRiskUsers(token),
        loadPredictiveInsights(token),
        loadNaturalLanguageSummary(token)
      ]);
      
    } catch (err) {
      console.error('Error loading AI intelligence data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load AI intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const loadIntelligenceReport = async (token: string) => {
    const response = await fetch('/api/ai-security/intelligence-report?includeDetails=true', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load intelligence report');
    }

    const result = await response.json();
    if (result.success) {
      setIntelligenceReport(result.data);
    }
  };

  const loadHighRiskUsers = async (token: string) => {
    const response = await fetch('/api/ai-security/high-risk-users?limit=20&includeProfiles=false', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load high-risk users');
    }

    const result = await response.json();
    if (result.success) {
      setHighRiskUsers(result.data);
    }
  };

  const loadPredictiveInsights = async (token: string) => {
    const response = await fetch('/api/ai-security/predictive-insights', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load predictive insights');
    }

    const result = await response.json();
    if (result.success) {
      setPredictiveInsights(result.data);
    }
  };

  const loadNaturalLanguageSummary = async (token: string) => {
    const response = await fetch('/api/ai-security/natural-language-summary', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load natural language summary');
    }

    const result = await response.json();
    if (result.success) {
      setNaturalLanguageSummary(result.data);
    }
  };

  const forceAnalysis = async () => {
    setAnalysisInProgress(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/ai-security/force-analysis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to force analysis');
      }

      // Reload data after forced analysis
      await loadAIIntelligenceData();
      
    } catch (err) {
      console.error('Error forcing analysis:', err);
      setError(err instanceof Error ? err.message : 'Failed to force analysis');
    } finally {
      setAnalysisInProgress(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-700 bg-red-100 border-red-200';
      case 'high': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-700 bg-green-100 border-green-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <FaExclamationTriangle className="text-red-600" />;
      case 'high': return <FaExclamationTriangle className="text-orange-600" />;
      case 'medium': return <FaExclamationTriangle className="text-yellow-600" />;
      case 'low': return <FaExclamationTriangle className="text-blue-600" />;
      default: return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  const getConfidenceBar = (confidence: number) => {
    const percentage = Math.round(confidence * 100);
    const color = confidence >= 0.8 ? 'bg-green-500' : confidence >= 0.6 ? 'bg-yellow-500' : 'bg-red-500';
    
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* AI System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FaRobot className="mr-2 text-blue-600" />
            AI Security Intelligence Status
          </h3>
          <button
            onClick={forceAnalysis}
            disabled={analysisInProgress}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              analysisInProgress
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {analysisInProgress ? 'Analyzing...' : 'Force Analysis'}
          </button>
        </div>
        
        {intelligenceReport && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{intelligenceReport.systemHealthScore}/100</div>
              <div className="text-sm text-gray-600">System Health Score</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getRiskLevelColor(intelligenceReport.overallRiskLevel).split(' ')[0]}`}>
                {intelligenceReport.overallRiskLevel.toUpperCase()}
              </div>
              <div className="text-sm text-gray-600">Overall Risk Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{intelligenceReport.threatDetections.length}</div>
              <div className="text-sm text-gray-600">Active Threats</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{intelligenceReport.behavioralAnomalies.length}</div>
              <div className="text-sm text-gray-600">Behavioral Anomalies</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Insights */}
      {predictiveInsights.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaLightbulb className="mr-2 text-yellow-600" />
            Top AI Predictions
          </h3>
          <div className="space-y-3">
            {predictiveInsights.slice(0, 3).map((insight, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{insight.type.replace('_', ' ').toUpperCase()}</span>
                  <span className="text-sm text-gray-600">{insight.confidenceLevel || Math.round(insight.confidence * 100)}% confidence</span>
                </div>
                <p className="text-sm text-gray-700">{insight.prediction}</p>
                <div className="mt-2">
                  {getConfidenceBar(insight.confidence)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High-Risk Users Summary */}
      {highRiskUsers.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FaUsers className="mr-2 text-red-600" />
            High-Risk Users ({highRiskUsers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {highRiskUsers.slice(0, 6).map((user) => (
              <div key={user.userId} className={`p-3 rounded-lg border ${getRiskLevelColor(user.riskLevel)}`}>
                <div className="font-medium text-sm">{user.email}</div>
                <div className="text-xs mt-1">{user.summary}</div>
                <div className="text-xs mt-1 text-gray-600">Risk Score: {user.riskScore}/100</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderThreats = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-600" />
          AI-Detected Threats ({intelligenceReport?.threatDetections.length || 0})
        </h3>
        
        {intelligenceReport?.threatDetections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaShieldAlt className="mx-auto h-12 w-12 mb-4 text-green-500" />
            <p>No active threats detected by AI analysis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {intelligenceReport?.threatDetections.map((threat) => (
              <div key={threat.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getSeverityIcon(threat.severity)}
                    <span className="ml-2 font-medium text-gray-900">{threat.type}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(threat.severity)}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-700 mb-3">{threat.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Confidence:</strong> {Math.round(threat.confidence * 100)}%
                    <div className="mt-1">{getConfidenceBar(threat.confidence)}</div>
                  </div>
                  <div>
                    <strong>Affected Users:</strong> {threat.affectedUsers.length}
                  </div>
                </div>
                
                {threat.mitigationSteps.length > 0 && (
                  <div className="mt-4">
                    <strong className="text-sm">AI Recommended Actions:</strong>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                      {threat.mitigationSteps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderBehavioral = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MdPsychology className="mr-2 text-purple-600" />
          Behavioral Anomalies ({intelligenceReport?.behavioralAnomalies.length || 0})
        </h3>
        
        {intelligenceReport?.behavioralAnomalies.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaEye className="mx-auto h-12 w-12 mb-4 text-green-500" />
            <p>No behavioral anomalies detected</p>
          </div>
        ) : (
          <div className="space-y-4">
            {intelligenceReport?.behavioralAnomalies.map((anomaly, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <MdPsychology className="text-purple-600 mr-2" />
                    <span className="font-medium text-gray-900">{anomaly.email}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(anomaly.severity)}`}>
                    {anomaly.severity.toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Anomaly Type:</strong> {anomaly.anomalyType.replace('_', ' ')}
                  </div>
                  <div>
                    <strong>Confidence:</strong> {Math.round(anomaly.confidence * 100)}%
                  </div>
                </div>
                
                <p className="text-gray-700 mt-2">{anomaly.description}</p>
                
                {anomaly.riskFactors.length > 0 && (
                  <div className="mt-3">
                    <strong className="text-sm">Risk Factors:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {anomaly.riskFactors.map((factor, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPredictions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaLightbulb className="mr-2 text-yellow-600" />
          AI Predictive Insights ({predictiveInsights.length})
        </h3>
        
        {predictiveInsights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaChartLine className="mx-auto h-12 w-12 mb-4 text-gray-400" />
            <p>No predictive insights available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {predictiveInsights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <FaLightbulb className="text-yellow-600 mr-2" />
                    <span className="font-medium text-gray-900">{insight.type.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(insight.impactLevel)}`}>
                      {insight.impactLevel.toUpperCase()} IMPACT
                    </span>
                    {insight.actionPriority && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {insight.actionPriority.toUpperCase()} PRIORITY
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{insight.prediction}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div>
                    <strong>Confidence:</strong> {insight.confidenceLevel || Math.round(insight.confidence * 100)}%
                    <div className="mt-1">{getConfidenceBar(insight.confidence)}</div>
                  </div>
                  <div>
                    <strong>Timeframe:</strong> {insight.timeframe}
                  </div>
                  <div>
                    <strong>Implementation:</strong> {insight.implementation?.difficulty || 'TBD'}
                  </div>
                </div>
                
                {insight.businessImpact && (
                  <div className="mb-3">
                    <strong className="text-sm">Business Impact:</strong>
                    <p className="text-sm text-gray-700 mt-1">{insight.businessImpact}</p>
                  </div>
                )}
                
                {insight.preventiveActions.length > 0 && (
                  <div>
                    <strong className="text-sm">Recommended Actions:</strong>
                    <ul className="mt-1 list-disc list-inside text-sm text-gray-700">
                      {insight.preventiveActions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      {naturalLanguageSummary && (
        <>
          {/* Executive Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MdReport className="mr-2 text-blue-600" />
              AI Executive Summary
            </h3>
            <div className="prose max-w-none">
              <p className="text-lg text-gray-800 font-medium mb-4">{naturalLanguageSummary.executiveSummary}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-4 rounded-lg border ${getRiskLevelColor(naturalLanguageSummary.riskAssessment.level)}`}>
                  <h4 className="font-semibold mb-2">Risk Assessment</h4>
                  <p className="text-sm">{naturalLanguageSummary.riskAssessment.description}</p>
                </div>
                
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <h4 className="font-semibold mb-2 text-blue-800">Trend Analysis</h4>
                  <p className="text-sm text-blue-700">{naturalLanguageSummary.trendAnalysis}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Findings */}
          {naturalLanguageSummary.keyFindings.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key AI Findings</h3>
              <div className="space-y-2">
                {naturalLanguageSummary.keyFindings.map((finding, index) => (
                  <div key={index} className="flex items-start">
                    <FaLightbulb className="text-yellow-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-gray-700">{finding}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Insights */}
          {naturalLanguageSummary.actionableInsights.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actionable Insights</h3>
              <div className="space-y-2">
                {naturalLanguageSummary.actionableInsights.map((insight, index) => (
                  <div key={index} className="flex items-start">
                    <FaExclamationTriangle className="text-orange-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Recommendations</h3>
            
            <div className="space-y-4">
              {naturalLanguageSummary.recommendations.immediate.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">🚨 Immediate Actions</h4>
                  <div className="space-y-2">
                    {naturalLanguageSummary.recommendations.immediate.map((rec, index) => (
                      <div key={index} className="border-l-4 border-red-500 pl-3">
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {naturalLanguageSummary.recommendations.shortTerm.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-800 mb-2">⚡ Short-term Actions</h4>
                  <div className="space-y-2">
                    {naturalLanguageSummary.recommendations.shortTerm.map((rec, index) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-3">
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {naturalLanguageSummary.recommendations.longTerm.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-800 mb-2">📋 Long-term Planning</h4>
                  <div className="space-y-2">
                    {naturalLanguageSummary.recommendations.longTerm.map((rec, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-3">
                        <p className="font-medium">{rec.title}</p>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Full Narrative */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete AI Analysis</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                {naturalLanguageSummary.fullNarrativeSummary}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FaUsers className="mr-2 text-red-600" />
          AI-Identified High-Risk Users ({highRiskUsers.length})
        </h3>
        
        {highRiskUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaShieldAlt className="mx-auto h-12 w-12 mb-4 text-green-500" />
            <p>No high-risk users identified by AI analysis</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Level</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threats</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flags</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Summary</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highRiskUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">ID: {user.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(user.riskLevel)}`}>
                        {user.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.riskScore}/100</div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            user.riskScore >= 80 ? 'bg-red-500' :
                            user.riskScore >= 60 ? 'bg-orange-500' :
                            user.riskScore >= 30 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${user.riskScore}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.threatCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.flagCount}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate" title={user.summary}>
                        {user.summary}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <FaExclamationTriangle className="h-5 w-5 text-red-400 mr-2" />
          <h3 className="text-lg font-medium text-red-800">AI Intelligence Error</h3>
        </div>
        <p className="mt-2 text-red-700">{error}</p>
        <button
          onClick={loadAIIntelligenceData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaBrain className="mr-3 text-purple-600" />
            AI Security Intelligence
          </h2>
          <div className="text-sm text-gray-500">
            {intelligenceReport && (
              <>Last Analysis: {new Date(intelligenceReport.timestamp).toLocaleString()}</>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'threats' && renderThreats()}
        {activeTab === 'behavioral' && renderBehavioral()}
        {activeTab === 'predictions' && renderPredictions()}
        {activeTab === 'summary' && renderSummary()}
        {activeTab === 'users' && renderUsers()}
      </div>
    </div>
  );
}; 