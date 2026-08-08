import React, { useState } from 'react';
import { Search, Shield, CheckCircle, XCircle, AlertTriangle, Ban, Info, Clock, FileWarning, PhoneOff } from 'lucide-react';

type CeirStatus = 'idle' | 'loading' | 'valid' | 'blocked' | 'lost' | 'stolen' | 'not_found';

interface CeirResult {
  imei: string;
  status: CeirStatus;
  ceirStatus: 'Valid' | 'Blocked' | 'Lost' | 'Stolen';
  reason?: string;
  reportDate?: string;
  reportedBy?: string;
  blockDate?: string;
  telecomOperator?: string;
  circleBlocked?: string;
  fir?: string;
  policeStation?: string;
  checkedAt: string;
}

const CEIR_DATABASE: Record<string, Omit<CeirResult, 'imei' | 'checkedAt' | 'status'>> = {
  '352000123456785': {
    ceirStatus: 'Valid',
    telecomOperator: 'Airtel',
    circleBlocked: 'None',
  },
  '358240991234567': {
    ceirStatus: 'Valid',
    telecomOperator: 'Jio',
    circleBlocked: 'None',
  },
  '869678034567896': {
    ceirStatus: 'Blocked',
    reason: 'Device reported lost by subscriber',
    reportDate: '2026-04-15',
    reportedBy: 'Subscriber via CEIR Portal',
    blockDate: '2026-04-16',
    telecomOperator: 'BSNL',
    circleBlocked: 'Maharashtra & Goa',
  },
  '490154203237518': {
    ceirStatus: 'Stolen',
    reason: 'FIR filed for theft — device reported to DoT',
    reportDate: '2026-05-02',
    reportedBy: 'Police via CEIR Portal',
    blockDate: '2026-05-03',
    telecomOperator: 'Vi',
    circleBlocked: 'All India',
    fir: 'FIR/2026/0123',
    policeStation: 'Shivajinagar Police Station, Pune',
  },
  '013554006297216': {
    ceirStatus: 'Lost',
    reason: 'Device reported lost — CEIR blocking initiated',
    reportDate: '2026-06-10',
    reportedBy: 'Subscriber via Sanchar Saathi Portal',
    blockDate: '2026-06-11',
    telecomOperator: 'Airtel',
    circleBlocked: 'Karnataka',
  },
};

function getStatusConfig(status: CeirStatus) {
  switch (status) {
    case 'valid':
      return {
        icon: CheckCircle, color: 'text-green-400',
        bg: 'bg-green-500/10 border-green-500/30',
        label: 'Valid — Not Blocked in CEIR',
        badge: 'bg-green-500/20 text-green-400 border-green-500/40',
      };
    case 'blocked':
      return {
        icon: Ban, color: 'text-orange-400',
        bg: 'bg-orange-500/10 border-orange-500/30',
        label: 'Blocked — Device Suspended in CEIR',
        badge: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      };
    case 'lost':
      return {
        icon: FileWarning, color: 'text-yellow-400',
        bg: 'bg-yellow-500/10 border-yellow-500/30',
        label: 'Lost — Reported as Lost Device',
        badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      };
    case 'stolen':
      return {
        icon: AlertTriangle, color: 'text-destructive',
        bg: 'bg-destructive/10 border-destructive/30',
        label: 'Stolen — FIR Registered Device',
        badge: 'bg-destructive/20 text-destructive border-destructive/40',
      };
    case 'not_found':
      return {
        icon: XCircle, color: 'text-muted-foreground',
        bg: 'bg-secondary/50 border-border',
        label: 'Not Found in CEIR Database',
        badge: 'bg-secondary text-muted-foreground border-border',
      };
    default:
      return {
        icon: Shield, color: 'text-primary',
        bg: 'bg-primary/10 border-primary/30',
        label: 'Awaiting Verification',
        badge: '',
      };
  }
}

export default function CeirVerification() {
  const [imei, setImei] = useState('');
  const [status, setStatus] = useState<CeirStatus>('idle');
  const [result, setResult] = useState<CeirResult | null>(null);
  const [error, setError] = useState('');

  function validateImei(value: string) {
    if (!/^\d+$/.test(value)) return 'IMEI must contain digits only';
    if (value.length !== 15) return 'IMEI must be exactly 15 digits';
    return '';
  }

  function handleCheck() {
    setError('');
    const validationError = validateImei(imei.trim());
    if (validationError) { setError(validationError); return; }

    setStatus('loading');
    setTimeout(() => {
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const match = CEIR_DATABASE[imei.trim()];

      if (!match) {
        setResult(null);
        setStatus('not_found');
        return;
      }

      const statusMap: Record<string, CeirStatus> = {
        Valid: 'valid', Blocked: 'blocked', Lost: 'lost', Stolen: 'stolen',
      };

      const info: CeirResult = {
        ...match,
        imei: imei.trim(),
        status: statusMap[match.ceirStatus] || 'not_found',
        checkedAt: now,
      };
      setResult(info);
      setStatus(info.status);
    }, 1400);
  }

  function handleClear() {
    setImei('');
    setStatus('idle');
    setResult(null);
    setError('');
  }

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const SAMPLE_IMEIS = [
    { imei: '352000123456785', label: 'Valid' },
    { imei: '869678034567896', label: 'Blocked' },
    { imei: '013554006297216', label: 'Lost' },
    { imei: '490154203237518', label: 'Stolen' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <PhoneOff className="w-6 h-6 text-orange-400" />
          </div>
          CEIR Verification
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Check if a device is blocked, reported lost, or stolen in India's Central Equipment Identity Register (CEIR) maintained by the Department of Telecommunications.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-300">
          <span className="font-semibold">About CEIR:</span> The Central Equipment Identity Register (CEIR) is a government initiative by DoT, India. It allows subscribers to block/unblock stolen or lost mobile devices across all telecom networks. Blocked IMEIs cannot be used on any network in India.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-foreground">Check CEIR Status</h2>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={imei}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                setImei(val);
                setError('');
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
              placeholder="Enter 15-digit IMEI to check CEIR status"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/60 transition-all placeholder:tracking-normal placeholder:font-sans"
              maxLength={15}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" /> {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleCheck}
              disabled={status === 'loading' || imei.length < 15}
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><span className="animate-spin">⟳</span> Checking CEIR...</>
              ) : (
                <><Search className="w-4 h-4" /> Check CEIR Status</>
              )}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-all"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Sample IMEIs */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Info className="w-3 h-3" /> Try sample IMEIs:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IMEIS.map(({ imei: s, label }) => (
              <button
                key={s}
                onClick={() => { setImei(s); setError(''); setStatus('idle'); setResult(null); }}
                className="text-xs bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground px-3 py-1.5 rounded border border-border/50 transition-all flex items-center gap-1.5"
              >
                <span className="font-mono">{s.slice(0, 6)}…</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                  label === 'Valid' ? 'bg-green-500/20 text-green-400 border-green-500/40' :
                  label === 'Blocked' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
                  label === 'Lost' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
                  'bg-destructive/20 text-destructive border-destructive/40'
                }`}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {status !== 'idle' && status !== 'loading' && (
        <div className={`border rounded-xl p-4 flex items-center gap-3 ${statusConfig.bg}`}>
          <StatusIcon className={`w-6 h-6 shrink-0 ${statusConfig.color}`} />
          <div>
            <p className={`font-semibold text-sm ${statusConfig.color}`}>{statusConfig.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              IMEI checked: <span className="font-mono text-foreground">{imei}</span>
            </p>
          </div>
        </div>
      )}

      {/* CEIR Result Details */}
      {result && status !== 'not_found' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-orange-400" />
              CEIR Status Report
            </h2>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wide ${statusConfig.badge}`}>
                {result.ceirStatus}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" /> {result.checkedAt}
              </span>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Core Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'Blocked', value: result.ceirStatus === 'Blocked' ? 'YES' : 'NO',
                  active: result.ceirStatus === 'Blocked',
                  icon: Ban,
                },
                {
                  label: 'Lost', value: result.ceirStatus === 'Lost' ? 'YES' : 'NO',
                  active: result.ceirStatus === 'Lost',
                  icon: FileWarning,
                },
                {
                  label: 'Stolen', value: result.ceirStatus === 'Stolen' ? 'YES' : 'NO',
                  active: result.ceirStatus === 'Stolen',
                  icon: AlertTriangle,
                },
                {
                  label: 'Valid', value: result.ceirStatus === 'Valid' ? 'YES' : 'NO',
                  active: result.ceirStatus === 'Valid',
                  icon: CheckCircle,
                },
              ].map(({ label, value, active, icon: Icon }) => (
                <div
                  key={label}
                  className={`rounded-lg p-4 border text-center space-y-2 ${
                    active && label !== 'Valid'
                      ? 'bg-destructive/10 border-destructive/30'
                      : active
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-secondary/30 border-border/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 mx-auto ${
                    active && label !== 'Valid' ? 'text-destructive' :
                    active ? 'text-green-400' : 'text-muted-foreground/30'
                  }`} />
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={`font-bold text-sm ${
                      active && label !== 'Valid' ? 'text-destructive' :
                      active ? 'text-green-400' : 'text-muted-foreground/40'
                    }`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                { label: 'IMEI Number', value: result.imei, mono: true },
                { label: 'Telecom Operator', value: result.telecomOperator || 'N/A' },
                { label: 'Circles Blocked', value: result.circleBlocked || 'None' },
                result.reason && { label: 'Reason', value: result.reason },
                result.reportDate && { label: 'Report Date', value: result.reportDate },
                result.reportedBy && { label: 'Reported By', value: result.reportedBy },
                result.blockDate && { label: 'Block Date', value: result.blockDate },
                result.fir && { label: 'FIR Number', value: result.fir, mono: true },
                result.policeStation && { label: 'Police Station', value: result.policeStation },
              ].filter(Boolean).map((item: any) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className={`text-sm text-foreground font-medium ${item.mono ? 'font-mono' : ''}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Advisory */}
          <div className="border-t border-border p-5">
            {result.ceirStatus === 'Valid' ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Device Cleared — Not Blocked in CEIR
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This device is not blocked, lost, or stolen in the CEIR database. It is eligible to be activated on all Indian telecom networks and may be listed on Phoneefy.
                </p>
              </div>
            ) : (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Action Required — Device Flagged in CEIR
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This device is flagged in India's CEIR system. It cannot be activated on any Indian telecom network. Listing this device on Phoneefy is strictly prohibited. If you have received this device legitimately, contact DoT or your telecom operator to resolve the status.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Not Found */}
      {status === 'not_found' && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
          <XCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-foreground font-semibold">IMEI Not Found in CEIR</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            This IMEI was not found in the CEIR database. The device may be unregistered or use a non-standard IMEI. Proceed with caution.
          </p>
        </div>
      )}
    </div>
  );
}
