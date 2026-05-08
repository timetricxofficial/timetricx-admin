import React from 'react';
import { 
  FileText, 
  Target, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ShieldAlert,
  Info,
  UserCheck,
  Calendar,
  XCircle
} from 'lucide-react';

interface ExportTemplateProps {
  user: any;
  stats: any;
  insights: any;
  date: string;
  isMultiDay: boolean;
  multiDayData?: {
    summary: {
      totalDays: number;
      presentDays: number;
      partialDays: number;
      absentDays: number;
      avgConfidence: number;
      overallConsistency: number;
    };
    trendData: { date: string; confidence: number }[];
    dailyDetails: Array<{
      date: string;
      avgConfidence: number;
      highestConfidence: number;
      attempts: number;
      status: 'Present' | 'Partial' | 'Absent';
      reliability: number;
      consistencyScore: number;
    }>;
    reliabilityScore: number;
    behavior: 'Reliable' | 'Inconsistent' | 'Suspicious';
  };
}

export const ExportTemplate: React.FC<ExportTemplateProps> = ({ 
  user, 
  stats, 
  insights, 
  date,
  isMultiDay,
  multiDayData 
}) => {
  const failRatio = stats.total > 0 ? (stats.suspicious / stats.total) * 100 : 0;
  const avgConfidence = stats.total > 0 ? (stats.avgConfidence || 0) : 0;
  const successRate = stats.total > 0 ? (stats.success / stats.total) * 100 : 0;
  
  // Logic for Status based on fail ratio
  let status = "RELIABLE";
  let statusColor = "text-green-500";
  let statusBg = "bg-green-500/10";
  
  if (stats.total === 0) {
    status = "NO DATA";
    statusColor = "text-gray-500";
    statusBg = "bg-gray-500/10";
  } else if (failRatio > 50) {
    status = "SUSPICIOUS";
    statusColor = "text-red-500";
    statusBg = "bg-red-500/10";
  } else if (failRatio >= 30) {
    status = "INCONSISTENT";
    statusColor = "text-yellow-500";
    statusBg = "bg-yellow-500/10";
  }

  // Dynamic Observations Generator
  const getObservations = () => {
    const obs: string[] = [];
    if (status === 'RELIABLE') {
      obs.push("User demonstrated highly consistent presence throughout the monitored duration.");
      obs.push("Most verification attempts yielded confidence scores above the verified threshold (0.50).");
      obs.push("Biometric pattern indicates the user remained stationary and visible during scheduled checks.");
      obs.push("Minimal detection failures suggest optimal lighting and environmental conditions.");
    } else if (status === 'INCONSISTENT') {
      obs.push("User presence was intermittent, with several periods of non-detection or low confidence.");
      obs.push("Fluctuations in confidence scores suggest frequent movement or suboptimal positioning.");
      obs.push("System recorded a significant number of 'Partial' matches, indicating face was only partially visible.");
      obs.push("The detection pattern shows the user was away from the workstation during specific intervals.");
      obs.push("Consistency score is moderate, requiring closer supervision to ensure compliance.");
    } else {
      obs.push("Critical alert: User was not detected in more than 50% of the scheduled verification windows.");
      obs.push("Detection logs show sustained periods of 'No Face Detected' despite active session status.");
      obs.push("Majority of attempts fell below the minimum lenient threshold (0.25).");
      obs.push("The irregular biometric signature suggests possible absence or deliberate camera obstruction.");
      obs.push("High failure ratio indicates a failure to maintain the required presence standards.");
    }

    if (stats.maxGapHours > 1) {
      obs.push(`A significant inactivity gap of ${stats.maxGapHours}h was identified, suggesting a long period of absence.`);
    }
    if (avgConfidence < 0.4) {
      obs.push("Average confidence is critically low, suggesting environmental issues or poor user engagement with the system.");
    }
    return obs;
  };

  // Dynamic Recommendations Generator
  const getRecommendations = () => {
    const recs = [
      "Ensure the user is informed about the importance of remaining visible during work hours.",
      "Check environmental factors like backlighting or camera angle that might affect detection."
    ];
    if (status !== 'RELIABLE') {
      recs.push("Schedule a manual review of the session logs with the user.");
      recs.push("Implement more frequent verification intervals for this user to increase tracking density.");
      recs.push("Advise the user to use a high-definition webcam for better biometric accuracy.");
    }
    if (status === 'SUSPICIOUS') {
      recs.push("Flag this session for HR review due to high failure ratio.");
      recs.push("Consider implementing secondary verification methods (e.g., screen tracking) for future sessions.");
    }
    return recs;
  };

  const observations = getObservations();
  const recommendations = getRecommendations();

  const getSessionInsight = (sessionData: any[], sessionName: string) => {
    if (!sessionData || sessionData.length === 0) return `No data recorded for the ${sessionName}.`;
    
    const sessionSuccess = sessionData.filter(a => a.confidence >= 0.5).length;
    const sessionRatio = (sessionSuccess / sessionData.length) * 100;
    const sessionAvg = sessionData.reduce((acc, curr) => acc + curr.confidence, 0) / sessionData.length;

    if (sessionRatio >= 80) return "High stability. Consistent detections with verified confidence levels.";
    if (sessionRatio >= 50) return "Moderate presence. Some fluctuations in detection confidence recorded.";
    if (sessionAvg < 0.3) return "Critically low confidence. Frequent detection failures or suboptimal matches.";
    return "Inconsistent session. Significant periods of non-detection or low confidence.";
  };

  // Multi-day specific calculations
  const getMultiDayStatus = () => {
    if (!multiDayData) return "RELIABLE";
    return multiDayData.behavior.toUpperCase();
  };

  const getMultiDayStatusColor = () => {
    if (!multiDayData) return "text-green-500";
    const behavior = multiDayData.behavior;
    if (behavior === 'Reliable') return 'text-green-500';
    if (behavior === 'Inconsistent') return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMultiDayStatusBg = () => {
    if (!multiDayData) return "bg-green-500/10";
    const behavior = multiDayData.behavior;
    if (behavior === 'Reliable') return 'bg-green-500/10';
    if (behavior === 'Inconsistent') return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getMultiDayObservations = () => {
    if (!multiDayData) return [];
    const obs: string[] = [];
    const { summary, dailyDetails, behavior } = multiDayData;

    if (behavior === 'Reliable') {
      obs.push(`User demonstrated consistent presence across ${summary.totalDays} monitored days.`);
      obs.push(`Present on ${summary.presentDays} days out of ${summary.totalDays} total days (${((summary.presentDays/summary.totalDays)*100).toFixed(0)}% attendance).`);
      obs.push(`Average confidence score of ${summary.avgConfidence.toFixed(2)} indicates reliable biometric verification.`);
      obs.push(`Overall consistency score of ${summary.overallConsistency.toFixed(0)}% shows stable engagement pattern.`);
    } else if (behavior === 'Inconsistent') {
      obs.push(`User presence was intermittent across the monitored period.`);
      obs.push(`Present on ${summary.presentDays} days, partial on ${summary.partialDays} days, and absent on ${summary.absentDays} days.`);
      obs.push(`Fluctuating confidence scores suggest variable environmental conditions or user positioning.`);
      obs.push(`Consistency score of ${summary.overallConsistency.toFixed(0)}% requires improvement to meet reliability standards.`);
    } else {
      obs.push(`Critical alert: User was absent on ${summary.absentDays} out of ${summary.totalDays} days.`);
      obs.push(`Low attendance rate of ${((summary.presentDays/summary.totalDays)*100).toFixed(0)}% indicates serious compliance issues.`);
      obs.push(`Average confidence score of ${summary.avgConfidence.toFixed(2)} is below acceptable threshold.`);
      obs.push(`High absence pattern suggests potential policy violations or technical issues.`);
    }

    if (summary.avgConfidence < 0.4) {
      obs.push("Average confidence is critically low across multiple days, suggesting persistent environmental issues.");
    }
    return obs;
  };

  const getMultiDayRecommendations = () => {
    if (!multiDayData) return [];
    const recs: string[] = [];
    const { behavior } = multiDayData;

    recs.push("Review the daily breakdown to identify patterns in absence or low confidence.");
    recs.push("Ensure consistent lighting and camera positioning across all work sessions.");
    
    if (behavior !== 'Reliable') {
      recs.push("Schedule a performance review with the user to discuss attendance patterns.");
      recs.push("Consider implementing more frequent verification intervals for better tracking.");
      recs.push("Provide training on proper camera setup and workspace conditions.");
    }
    
    if (behavior === 'Suspicious') {
      recs.push("Escalate this case to HR for further investigation.");
      recs.push("Implement secondary verification methods for this user.");
      recs.push("Monitor this user more closely for the next 30 days.");
    }

    return recs;
  };

  return (
    <div id="pdf-export-additional-pages">
      {isMultiDay && multiDayData ? (
        <>
          {/* MULTI-DAY PAGE 2: SUMMARY & ANALYSIS */}
          <div id="pdf-page-2" className="bg-white text-gray-900 p-12 w-[1200px] min-h-[1600px] relative font-sans">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <FileText className="text-indigo-600" size={32} />
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">MULTI-DAY SUMMARY & ANALYSIS</h1>
            </div>

            {/* EXECUTIVE SUMMARY */}
            <div className="bg-indigo-50/50 rounded-3xl p-8 mb-8 border border-indigo-100/50">
              <h2 className="text-lg font-bold text-indigo-900 mb-4 tracking-wide uppercase">EXECUTIVE SUMMARY</h2>
              <ul className="grid grid-cols-1 gap-4">
                <li className="flex items-start gap-3 text-gray-700 leading-relaxed bg-white/40 p-3 rounded-xl border border-indigo-100/30">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <p>Comprehensive multi-day monitoring of user presence was executed using AI-driven face verification across {multiDayData.summary.totalDays} days.</p>
                </li>
                <li className="flex items-start gap-3 text-gray-700 leading-relaxed bg-white/40 p-3 rounded-xl border border-indigo-100/30">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <p>User was present on <span className="font-bold text-green-600">{multiDayData.summary.presentDays}</span> days, partial on <span className="font-bold text-yellow-600">{multiDayData.summary.partialDays}</span> days, and absent on <span className="font-bold text-red-600">{multiDayData.summary.absentDays}</span> days.</p>
                </li>
                <li className="flex items-start gap-3 text-gray-700 leading-relaxed bg-white/40 p-3 rounded-xl border border-indigo-100/30">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <p>Overall behavioral classification indicates an <span className={`font-bold ${getMultiDayStatusColor()}`}>{getMultiDayStatus().toLowerCase()}</span> presence profile across the monitored period.</p>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* KEY HIGHLIGHTS */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-green-700 mb-6 flex items-center gap-2">
                  <Target size={20} /> KEY HIGHLIGHTS
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Days</p>
                      <p className="text-2xl font-bold text-gray-800">{multiDayData.summary.totalDays}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Present Days</p>
                      <p className="text-2xl font-bold text-gray-800">{multiDayData.summary.presentDays} <span className="text-sm font-normal text-gray-400">({((multiDayData.summary.presentDays/multiDayData.summary.totalDays)*100).toFixed(0)}%)</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Avg Confidence</p>
                      <p className="text-2xl font-bold text-gray-800">{multiDayData.summary.avgConfidence.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Overall Status</p>
                      <p className={`text-2xl font-bold ${getMultiDayStatusColor()}`}>{getMultiDayStatus()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRESENCE ANALYSIS */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-blue-700 mb-6 flex items-center gap-2">
                  <ShieldAlert size={20} /> PRESENCE ANALYSIS
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Partial Days</p>
                      <p className="text-2xl font-bold text-gray-800">{multiDayData.summary.partialDays} <span className="text-sm font-normal text-gray-400">({((multiDayData.summary.partialDays/multiDayData.summary.totalDays)*100).toFixed(0)}%)</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <XCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Absent Days</p>
                      <p className="text-2xl font-bold text-gray-800">{multiDayData.summary.absentDays} <span className="text-sm font-normal text-gray-400">({((multiDayData.summary.absentDays/multiDayData.summary.totalDays)*100).toFixed(0)}%)</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Overall Consistency</p>
                      <p className="text-2xl font-bold text-gray-800">{multiDayData.summary.overallConsistency.toFixed(0)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Reliability Score</p>
                      <p className="text-2xl font-bold text-gray-800">{multiDayData.reliabilityScore}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED OBSERVATIONS */}
            <div className="bg-white rounded-3xl p-8 border border-purple-100/50 shadow-sm flex-grow">
              <h2 className="text-lg font-bold text-purple-900 mb-6 tracking-wide uppercase flex items-center gap-2">
                <Info size={20} /> DETAILED OBSERVATIONS (IMPORTANT)
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {getMultiDayObservations().map((obs, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/30 border border-purple-100/20">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <p className="text-gray-700 font-medium leading-relaxed">{obs}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">T</div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Generated by</p>
                  <p className="text-sm font-bold text-gray-700">Cybershoora AI System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Generated On: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm font-bold text-gray-700 italic">Powered by Cybershoora Intelligence</p>
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400 font-medium">Page 2 of 3</div>
          </div>

          {/* MULTI-DAY PAGE 3: DETAILED FINDINGS & CONCLUSION */}
          <div id="pdf-page-3" className="bg-white text-gray-900 p-12 w-[1200px] min-h-[1600px] relative font-sans">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <AlertCircle className="text-indigo-600" size={32} />
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">DETAILED FINDINGS & CONCLUSION</h1>
            </div>

            <div className="grid grid-cols-[1.1fr_0.9fr] gap-8 mb-8">
              {/* RED FLAGS */}
              <div className="bg-red-50/30 rounded-3xl p-8 border border-red-100/50 flex flex-col">
                <h2 className="text-lg font-bold text-red-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
                   RED FLAGS & CRITICAL ALERTS
                </h2>
                <div className="space-y-5">
                  {multiDayData.summary.absentDays > 0 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">High Absence Rate</p>
                        <p className="text-xs text-gray-600 leading-snug">User was absent on {multiDayData.summary.absentDays} out of {multiDayData.summary.totalDays} days ({((multiDayData.summary.absentDays/multiDayData.summary.totalDays)*100).toFixed(0)}%).</p>
                      </div>
                    </div>
                  )}
                  {multiDayData.summary.avgConfidence < 0.4 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">Low Confidence Score</p>
                        <p className="text-xs text-gray-600 leading-snug">Average confidence of {multiDayData.summary.avgConfidence.toFixed(2)} is critically low across multiple days.</p>
                      </div>
                    </div>
                  )}
                  {multiDayData.summary.overallConsistency < 50 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">Poor Consistency</p>
                        <p className="text-xs text-gray-600 leading-snug">Overall consistency score of {multiDayData.summary.overallConsistency.toFixed(0)}% indicates highly irregular presence pattern.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-8">
                  <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-start gap-3 shadow-inner">
                    <Info className="text-orange-500 shrink-0 mt-0.5" size={24} />
                    <div>
                      <p className="text-sm font-bold text-orange-800 mb-1.5 uppercase tracking-wide">Methodology Note:</p>
                      <p className="text-xs text-orange-700 leading-relaxed font-medium">
                        Multi-day analysis aggregates daily face verification data to identify patterns in user presence, confidence scores, and overall reliability over the monitored period.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* CONCLUSION */}
                <div className="bg-green-50/30 rounded-3xl p-8 border border-green-100/50 shadow-sm">
                  <h2 className="text-lg font-bold text-green-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <CheckCircle2 size={20} /> FINAL CONCLUSION
                  </h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                      Data Validation Result: <span className={getMultiDayStatusColor()}>{getMultiDayStatus()} Presence Profile</span>
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Comprehensive analysis of {multiDayData.summary.totalDays} days confirms that the user was {multiDayData.behavior === 'Reliable' ? 'consistently present and engaged across the monitored period.' : 'unable to maintain consistent presence as required by policy.'}
                    </p>
                    <div className="pt-4 border-t border-green-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Final Behavioral Classification</p>
                      <div className={`inline-block px-6 py-2 rounded-2xl ${getMultiDayStatusBg()} ${getMultiDayStatusColor()} text-2xl font-black shadow-sm`}>
                        {getMultiDayStatus()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RECOMMENDATIONS & NEXT STEPS */}
            <div className="grid grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="bg-orange-50/30 rounded-3xl p-8 border border-orange-100/50">
                <h2 className="text-lg font-bold text-orange-700 mb-6 uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp size={20} /> RECOMMENDATION & NEXT STEPS
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {getMultiDayRecommendations().map((rec, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-orange-100 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                        <Target size={16} />
                      </div>
                      <p className="text-sm text-gray-700 font-semibold leading-snug">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINAL VERDICT BOX */}
              <div className={`rounded-3xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center shadow-lg ${getMultiDayStatusBg()}`}>
                <div className={`w-20 h-20 rounded-3xl bg-white flex items-center justify-center ${getMultiDayStatusColor()} mb-6 shadow-xl`}>
                  <ShieldAlert size={40} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">OFFICIAL VERDICT</p>
                <p className={`text-3xl font-black ${getMultiDayStatusColor()} mb-3 tracking-tighter`}>{getMultiDayStatus()}</p>
                <div className="h-0.5 w-12 bg-current opacity-20 mb-4" />
                <p className="text-xs text-gray-600 font-bold leading-relaxed px-4">
                  Presence was detected {multiDayData.behavior === 'Reliable' ? 'and verified consistently across all monitored days.' : 'but verifications failed to meet reliability standards across multiple days.'}
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">T</div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Generated by</p>
                  <p className="text-sm font-bold text-gray-700">Cybershoora AI System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Generated On: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm font-bold text-gray-700 italic">Powered by Cybershoora Intelligence</p>
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400 font-medium">Page 3 of 3</div>
          </div>
        </>
      ) : (
        <>
          {/* SINGLE DAY PAGE 2: SUMMARY & ANALYSIS */}
          <div id="pdf-page-2" className="bg-white text-gray-900 p-12 w-[1200px] min-h-[1600px] relative font-sans">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <FileText className="text-indigo-600" size={32} />
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">SUMMARY & ANALYSIS</h1>
            </div>

            {/* EXECUTIVE SUMMARY */}
            <div className="bg-indigo-50/50 rounded-3xl p-8 mb-8 border border-indigo-100/50">
              <h2 className="text-lg font-bold text-indigo-900 mb-4 tracking-wide uppercase">EXECUTIVE SUMMARY</h2>
              <ul className="grid grid-cols-1 gap-4">
                <li className="flex items-start gap-3 text-gray-700 leading-relaxed bg-white/40 p-3 rounded-xl border border-indigo-100/30">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <p>Comprehensive monitoring of user presence was executed using AI-driven face verification. The session tracked biometric data at regular intervals to establish a reliability baseline.</p>
                </li>
                <li className="flex items-start gap-3 text-gray-700 leading-relaxed bg-white/40 p-3 rounded-xl border border-indigo-100/30">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <p>Quantitatively, the system captured <span className="font-bold text-indigo-700">{stats.total}</span> data points. Out of these, <span className="font-bold text-green-600">{stats.success}</span> were validated as successful detections.</p>
                </li>
                <li className="flex items-start gap-3 text-gray-700 leading-relaxed bg-white/40 p-3 rounded-xl border border-indigo-100/30">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <p>Qualitative analysis indicates an <span className={`font-bold ${statusColor}`}>{status.toLowerCase()}</span> presence profile, reflecting the user's overall visibility and engagement level during the monitored period.</p>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* KEY HIGHLIGHTS */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-green-700 mb-6 flex items-center gap-2">
                  <Target size={20} /> KEY HIGHLIGHTS
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Total Attempts</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Successful Detections</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.success} <span className="text-sm font-normal text-gray-400">({successRate.toFixed(1)}%)</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Average Confidence</p>
                      <p className="text-2xl font-bold text-gray-800">{avgConfidence.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Overall Status</p>
                      <p className={`text-2xl font-bold ${statusColor}`}>{status}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRESENCE ANALYSIS */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-bold text-blue-700 mb-6 flex items-center gap-2">
                  <ShieldAlert size={20} /> PRESENCE ANALYSIS
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Clock size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Inactivity Analysis</p>
                      <p className={`text-2xl font-bold ${stats.maxGapHours > 2 ? 'text-red-500' : 'text-gray-800'}`}>{stats.maxGapHours}h <span className="text-sm font-normal text-gray-400">Max Gap</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Activity size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Consistency Score</p>
                      <p className="text-2xl font-bold text-gray-800">{(1 - failRatio/100).toFixed(2)} <span className="text-sm font-normal text-gray-400">/ 1.0</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Failure Ratio</p>
                      <p className="text-2xl font-bold text-red-500">{failRatio.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <TrendingUp size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Presence Reliability</p>
                      <p className="text-2xl font-bold text-gray-800">{successRate > 80 ? 'High' : successRate > 50 ? 'Moderate' : 'Critical'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* DETAILED OBSERVATIONS */}
            <div className="bg-white rounded-3xl p-8 border border-purple-100/50 shadow-sm flex-grow">
              <h2 className="text-lg font-bold text-purple-900 mb-6 tracking-wide uppercase flex items-center gap-2">
                <Info size={20} /> DETAILED OBSERVATIONS (IMPORTANT)
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {observations.map((obs, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-purple-50/30 border border-purple-100/20">
                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-2 shrink-0" />
                    <p className="text-gray-700 font-medium leading-relaxed">{obs}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">T</div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Generated by</p>
                  <p className="text-sm font-bold text-gray-700">Cybershoora AI System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Generated On: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm font-bold text-gray-700 italic">Powered by Cybershoora Intelligence</p>
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400 font-medium">Page 2 of 3</div>
          </div>

          {/* SINGLE DAY PAGE 3: DETAILED FINDINGS & CONCLUSION */}
          <div id="pdf-page-3" className="bg-white text-gray-900 p-12 w-[1200px] min-h-[1600px] relative font-sans">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-gray-100">
              <AlertCircle className="text-indigo-600" size={32} />
              <h1 className="text-3xl font-bold tracking-tight text-gray-800">DETAILED FINDINGS & CONCLUSION</h1>
            </div>

            <div className="grid grid-cols-[1.1fr_0.9fr] gap-8 mb-8">
              {/* RED FLAGS */}
              <div className="bg-red-50/30 rounded-3xl p-8 border border-red-100/50 flex flex-col">
                <h2 className="text-lg font-bold text-red-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
                   RED FLAGS & CRITICAL ALERTS
                </h2>
                <div className="space-y-5">
                  {failRatio > 20 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">High Failure Ratio</p>
                        <p className="text-xs text-gray-600 leading-snug">Detection failed in {failRatio.toFixed(1)}% of attempts. This exceeds the acceptable deviation margin.</p>
                      </div>
                    </div>
                  )}
                  {stats.suspicious > 3 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">Absenteeism Indicators</p>
                        <p className="text-xs text-gray-600 leading-snug">Multiple sessions recorded 'No Face Detected', strongly suggesting absence from the workspace.</p>
                      </div>
                    </div>
                  )}
                  {avgConfidence < 0.5 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">Integrity Concerns</p>
                        <p className="text-xs text-gray-600 leading-snug">The average biometric confidence ({avgConfidence.toFixed(2)}) is below the required threshold for reliable identification.</p>
                      </div>
                    </div>
                  )}
                  {stats.maxGapHours > 1.5 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">Unaccounted Time Gap</p>
                        <p className="text-xs text-gray-600 leading-snug">A large inactivity gap of {stats.maxGapHours} hours was detected, violating the regular monitoring protocol.</p>
                      </div>
                    </div>
                  )}
                  {observations.length > 3 && (
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/60 border border-red-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <ShieldAlert size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-red-800 mb-0.5">Inconsistent Pattern</p>
                        <p className="text-xs text-gray-600 leading-snug">The biometric signature throughout the day is highly irregular and unpredictable.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto pt-8">
                  <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 flex items-start gap-3 shadow-inner">
                    <Info className="text-orange-500 shrink-0 mt-0.5" size={24} />
                    <div>
                      <p className="text-sm font-bold text-orange-800 mb-1.5 uppercase tracking-wide">Methodology Note:</p>
                      <p className="text-xs text-orange-700 leading-relaxed font-medium">
                        Presence is determined exclusively through automated AI face verification data. Check-in logs indicate system access but do not guarantee physical presence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                {/* ACTIVITY TIMELINE INSIGHTS */}
                <div className="bg-blue-50/30 rounded-3xl p-8 border border-blue-100/50">
                  <h2 className="text-lg font-bold text-blue-700 mb-8 uppercase tracking-wide flex items-center gap-2">
                    <Activity size={20} /> Timeline Insights
                  </h2>
                  <div className="space-y-8 relative">
                    <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-blue-100" />
                    {stats.segments && stats.segments.length > 0 ? (
                      stats.segments.map((segment: any, idx: number) => (
                        <div key={idx} className="relative pl-12">
                          <div className="absolute left-1.5 top-1.5 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-md" />
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{segment.label}</p>
                            <div className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${
                              segment.sessionStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              segment.sessionStatus === 'IN-PROGRESS' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {segment.sessionStatus}
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 font-medium leading-relaxed">
                            {getSessionInsight(segment.data, segment.label)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="relative pl-12">
                        <div className="absolute left-1.5 top-1.5 w-5 h-5 rounded-full bg-blue-500 border-4 border-white shadow-md" />
                        <p className="text-sm text-gray-500 font-medium">No session data available for timeline analysis.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CONCLUSION */}
                <div className="bg-green-50/30 rounded-3xl p-8 border border-green-100/50 shadow-sm">
                  <h2 className="text-lg font-bold text-green-700 mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <CheckCircle2 size={20} /> FINAL CONCLUSION
                  </h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700 font-semibold leading-relaxed">
                      Data Validation Result: <span className={statusColor}>{status} Presence Profile</span>
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Comprehensive analysis of {stats.total} data points confirms that the user was {status === 'RELIABLE' ? 'consistently present and engaged during the monitored session.' : 'unable to maintain consistent presence as required by policy.'}
                    </p>
                    <div className="pt-4 border-t border-green-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Final Behavioral Classification</p>
                      <div className={`inline-block px-6 py-2 rounded-2xl ${statusBg} ${statusColor} text-2xl font-black shadow-sm`}>
                        {status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RECOMMENDATIONS & NEXT STEPS */}
            <div className="grid grid-cols-[1.2fr_0.8fr] gap-8">
              <div className="bg-orange-50/30 rounded-3xl p-8 border border-orange-100/50">
                <h2 className="text-lg font-bold text-orange-700 mb-6 uppercase tracking-wide flex items-center gap-2">
                  <TrendingUp size={20} /> RECOMMENDATION & NEXT STEPS
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl border border-orange-100 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
                        <Target size={16} />
                      </div>
                      <p className="text-sm text-gray-700 font-semibold leading-snug">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* FINAL VERDICT BOX */}
              <div className={`rounded-3xl p-8 border border-gray-100 flex flex-col items-center justify-center text-center shadow-lg ${statusBg}`}>
                <div className={`w-20 h-20 rounded-3xl bg-white flex items-center justify-center ${statusColor} mb-6 shadow-xl`}>
                  <ShieldAlert size={40} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">OFFICIAL VERDICT</p>
                <p className={`text-3xl font-black ${statusColor} mb-3 tracking-tighter`}>{status}</p>
                <div className="h-0.5 w-12 bg-current opacity-20 mb-4" />
                <p className="text-xs text-gray-600 font-bold leading-relaxed px-4">
                  Presence was detected {status === 'RELIABLE' ? 'and verified consistently.' : 'but verifications failed to meet reliability standards.'}
                </p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end border-t border-gray-100 pt-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">T</div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest">Generated by</p>
                  <p className="text-sm font-bold text-gray-700">Cybershoora AI System</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Generated On: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p className="text-sm font-bold text-gray-700 italic">Powered by Cybershoora Intelligence</p>
              </div>
            </div>
            <div className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-400 font-medium">Page 3 of 3</div>
          </div>
        </>
      )}
    </div>
  );
};
