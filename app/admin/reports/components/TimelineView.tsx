'use client'

import { CheckCircle2, XCircle, Clock, AlertTriangle, Ghost } from 'lucide-react'

export default function TimelineView({ sessions, theme }: { sessions: any[], theme: string }) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <Ghost size={48} />
        <p className="mt-4 font-medium">No sessions found for this period</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
      {sessions.map((session, idx) => (
        <div 
          key={idx}
          className={`p-4 rounded-2xl border transition-all ${
            theme === 'dark' 
              ? 'bg-[#1e2129] border-gray-800/50 hover:border-gray-700' 
              : 'bg-gray-50/50 border-gray-100 hover:border-gray-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                session.finalStatus === 'success' ? 'bg-green-500/10 text-green-500' :
                session.finalStatus === 'suspicious' ? 'bg-red-500/10 text-red-500' :
                session.finalStatus === 'missed' ? 'bg-orange-500/10 text-orange-500' :
                'bg-blue-500/10 text-blue-500'
              }`}>
                {session.finalStatus === 'success' ? <CheckCircle2 size={18}/> :
                 session.finalStatus === 'suspicious' ? <AlertTriangle size={18}/> :
                 session.finalStatus === 'missed' ? <Ghost size={18}/> :
                 <Clock size={18}/>}
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">
                  {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[10px] opacity-50 font-bold uppercase">
                  {new Date(session.date).toDateString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                session.finalStatus === 'success' ? 'bg-green-500/20 text-green-500' :
                session.finalStatus === 'suspicious' ? 'bg-red-500/20 text-red-500' :
                'bg-orange-500/20 text-orange-500'
              }`}>
                {session.finalStatus}
              </span>
              {session.interruptedReason && (
                <span className="bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                  INTERRUPTED
                </span>
              )}
            </div>
          </div>

          {/* ATTEMPTS */}
          <div className="space-y-2">
            {session.attempts && session.attempts.length > 0 ? (
              session.attempts.map((attempt: any, aIdx: number) => (
                <div 
                  key={aIdx} 
                  className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                    theme === 'dark' ? 'bg-black/20' : 'bg-white/50 border'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="opacity-40 font-bold">Attempt {attempt.attemptNo}</span>
                    <span className="opacity-60">
                      {new Date(attempt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="opacity-40">Confidence:</span>
                      <span className={`font-bold ${
                        (attempt.confidence || 0) > 0.7 ? 'text-green-500' : 'text-orange-500'
                      }`}>
                        {Math.round((attempt.confidence || 0) * 100)}%
                      </span>
                    </div>
                    <div className={
                      attempt.status === 'success' ? 'text-green-500' : 
                      attempt.status === 'partial' ? 'text-yellow-500' : 
                      'text-red-500'
                    }>
                      {attempt.status === 'success' ? <CheckCircle2 size={14}/> : 
                       attempt.status === 'partial' ? <AlertTriangle size={14}/> : 
                       <XCircle size={14}/>}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[10px] opacity-40 italic py-1 pl-1">
                {session.finalStatus === 'missed' ? 'No attempts recorded - User was offline/away.' : 'No attempt data available.'}
              </div>
            )}
            
            {session.interruptedReason && (
              <div className="text-[10px] text-purple-400 bg-purple-500/5 p-2 rounded-lg border border-purple-500/10 italic">
                Reason: {session.interruptedReason.replace(/_/g, ' ')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
