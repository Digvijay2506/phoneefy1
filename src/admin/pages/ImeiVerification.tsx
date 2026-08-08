import React, { useState } from 'react';
import { Search, Smartphone, Shield, CheckCircle, XCircle, AlertTriangle, Info, Clock } from 'lucide-react';

type VerificationStatus = 'idle' | 'loading' | 'valid' | 'invalid' | 'blocked';

interface DeviceInfo {
  imei: string;
  brand: string;
  model: string;
  manufacturer: string;
  tac: string;
  serialNumber: string;
  networkType: string;
  countryOfOrigin: string;
  approvalStatus: string;
  imeiStatus: 'Clean' | 'Blacklisted' | 'Under Investigation';
  reportedLost: boolean;
  reportedStolen: boolean;
  warrantyStatus: string;
  manufactureDate: string;
  checkedAt: string;
}

// Demo device database keyed by first 6 digits (TAC)
const DEMO_DEVICES: Record<string, Omit<DeviceInfo, 'imei' | 'checkedAt'>> = {
  '352000': {
    brand: 'Apple', model: 'iPhone 12', manufacturer: 'Apple Inc.', tac: '352000',
    serialNumber: 'C7QMDKQFPLFK', networkType: '5G / LTE / UMTS / GSM',
    countryOfOrigin: 'China', approvalStatus: 'TEC Approved',
    imeiStatus: 'Clean', reportedLost: false, reportedStolen: false,
    warrantyStatus: 'Out of Warranty', manufactureDate: '2021-03',
  },
  '358240': {
    brand: 'Samsung', model: 'Galaxy S21', manufacturer: 'Samsung Electronics',
    tac: '358240', serialNumber: 'RZ8N803JQAB', networkType: '5G / LTE / GSM',
    countryOfOrigin: 'South Korea', approvalStatus: 'TEC Approved',
    imeiStatus: 'Clean', reportedLost: false, reportedStolen: false,
    warrantyStatus: 'Out of Warranty', manufactureDate: '2021-01',
  },
  '869678': {
    brand: 'Xiaomi', model: 'Redmi Note 11', manufacturer: 'Xiaomi Communications',
    tac: '869678', serialNumber: 'XM2022R0001', networkType: '4G LTE / GSM',
    countryOfOrigin: 'India', approvalStatus: 'BIS Certified',
    imeiStatus: 'Blacklisted', reportedLost: true, reportedStolen: false,
    warrantyStatus: 'Out of Warranty', manufactureDate: '2022-05',
  },
};

function getStatusConfig(status: VerificationStatus) {
  switch (status) {
    case 'valid':
      return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', label: 'IMEI Valid — Clean Device' };
    case 'invalid':
      return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30', label: 'IMEI Invalid — Not Found in Database' };
    case 'blocked':
      return { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', label: 'IMEI Flagged — Device Blacklisted' };
    default:
      return { icon: Shield, color: 'text-primary', bg: 'bg-primary/10 border-primary/30', label: 'Awaiting Verification' };
  }
}

export default function ImeiVerification() {
  const [imei, setImei] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [error, setError] = useState('');

  function validateImei(value: string) {
    if (!/^\d+$/.test(value)) return 'IMEI must contain digits only';
    if (value.length !== 15) return 'IMEI must be exactly 15 digits';
    // Luhn algorithm check
    let sum = 0;
    for (let i = 0; i < 15; i++) {
      let d = parseInt(value[i]);
      if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    if (sum % 10 !== 0) return 'Invalid IMEI checksum (Luhn check failed)';
    return '';
  }

  function handleCheck() {
    setError('');
    const validationError = validateImei(imei.trim());
    if (validationError) { setError(validationError); return; }

    setStatus('loading');
    setTimeout(() => {
      const tac = imei.slice(0, 6);
      const match = DEMO_DEVICES[tac];
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      if (!match) {
        setDevice(null);
        setStatus('invalid');
        return;
      }
      const info: DeviceInfo = { ...match, imei: imei.trim(), checkedAt: now };
      setDevice(info);
      setStatus(match.imeiStatus === 'Clean' ? 'valid' : 'blocked');
    }, 1200);
  }

  function handleClear() {
    setImei('');
    setStatus('idle');
    setDevice(null);
    setError('');
  }

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  const SAMPLE_IMEIS = ['352000123456785', '358240991234567', '869678034567896'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          IMEI Verification
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Verify a device's IMEI number to check its legitimacy and registration status before listing on the platform.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-2 mb-1">
          <Search className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Enter IMEI Number</h2>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={imei}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 15);
                setImei(val);
                setError('');
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
              placeholder="Enter 15-digit IMEI number"
              className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground font-mono tracking-widest text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all placeholder:tracking-normal placeholder:font-sans"
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
              className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <><span className="animate-spin">⟳</span> Checking IMEI...</>
              ) : (
                <><Search className="w-4 h-4" /> Check IMEI</>
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
            <Info className="w-3 h-3" /> Try a sample IMEI for demo:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IMEIS.map((s) => (
              <button
                key={s}
                onClick={() => { setImei(s); setError(''); setStatus('idle'); setDevice(null); }}
                className="text-xs font-mono bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground px-3 py-1.5 rounded border border-border/50 transition-all"
              >
                {s}
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
              IMEI: <span className="font-mono text-foreground">{imei}</span>
            </p>
          </div>
        </div>
      )}

      {/* Device Details */}
      {device && (status === 'valid' || status === 'blocked') && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-sm">Device Information</h2>
            <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {device.checkedAt}
            </span>
          </div>

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'IMEI Number', value: device.imei, mono: true },
              { label: 'Brand', value: device.brand },
              { label: 'Model', value: device.model },
              { label: 'Manufacturer', value: device.manufacturer },
              { label: 'TAC Code', value: device.tac, mono: true },
              { label: 'Serial Number', value: device.serialNumber, mono: true },
              { label: 'Network Type', value: device.networkType },
              { label: 'Country of Origin', value: device.countryOfOrigin },
              { label: 'Regulatory Approval', value: device.approvalStatus },
              { label: 'Manufacture Date', value: device.manufactureDate },
              { label: 'Warranty Status', value: device.warrantyStatus },
            ].map(({ label, value, mono }) => (
              <div key={label} className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                <p className={`text-sm text-foreground font-medium ${mono ? 'font-mono' : ''}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Verification Result */}
          <div className="border-t border-border p-5">
            <h3 className="text-sm font-semibold mb-4 text-foreground">Verification Result</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className={`rounded-lg p-4 border text-center ${device.imeiStatus === 'Clean' ? 'bg-green-500/10 border-green-500/30' : 'bg-destructive/10 border-destructive/30'}`}>
                <p className="text-xs text-muted-foreground mb-1">IMEI Status</p>
                <p className={`font-bold text-sm ${device.imeiStatus === 'Clean' ? 'text-green-400' : 'text-destructive'}`}>
                  {device.imeiStatus}
                </p>
              </div>
              <div className={`rounded-lg p-4 border text-center ${device.reportedLost ? 'bg-orange-500/10 border-orange-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <p className="text-xs text-muted-foreground mb-1">Lost Report</p>
                <p className={`font-bold text-sm ${device.reportedLost ? 'text-orange-400' : 'text-green-400'}`}>
                  {device.reportedLost ? 'Reported Lost' : 'Not Reported'}
                </p>
              </div>
              <div className={`rounded-lg p-4 border text-center ${device.reportedStolen ? 'bg-destructive/10 border-destructive/30' : 'bg-green-500/10 border-green-500/30'}`}>
                <p className="text-xs text-muted-foreground mb-1">Stolen Report</p>
                <p className={`font-bold text-sm ${device.reportedStolen ? 'text-destructive' : 'text-green-400'}`}>
                  {device.reportedStolen ? 'Reported Stolen' : 'Not Reported'}
                </p>
              </div>
            </div>

            {device.imeiStatus !== 'Clean' && (
              <div className="mt-4 bg-destructive/10 border border-destructive/30 rounded-lg p-4">
                <p className="text-sm text-destructive font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Action Required
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This device has been flagged in the IMEI database. Listing this device on Phoneefy is not permitted. Please contact the concerned authorities if you have received this device.
                </p>
              </div>
            )}

            {device.imeiStatus === 'Clean' && (
              <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> Device Cleared for Listing
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  This device's IMEI is clean with no blacklist records, loss reports, or theft reports. It is eligible to be listed on Phoneefy.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No result */}
      {status === 'invalid' && (
        <div className="bg-card border border-border rounded-xl p-8 text-center space-y-3">
          <XCircle className="w-12 h-12 text-muted-foreground mx-auto" />
          <p className="text-foreground font-semibold">IMEI Not Found</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            The entered IMEI number was not found in the device registry. It may be an unofficial import or an unregistered device. Listing is not recommended.
          </p>
        </div>
      )}
    </div>
  );
}
