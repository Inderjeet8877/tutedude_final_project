import { useState, useRef, useEffect } from 'react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanFace, ScanLine, AlertTriangle, ShieldCheck, DoorOpen, DoorClosed, Loader2, KeyRound, Camera, Keyboard } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';

const SecurityScanner = () => {
  const [passCode, setPassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('camera'); // 'camera' or 'manual'
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [scannedPassCode, setScannedPassCode] = useState('');
  const [smsStatus, setSmsStatus] = useState(null); // { sent, message, devOtp }
  const inputRef = useRef(null);

  // Keep focus on input for physical barcode scanners in manual mode
  useEffect(() => {
    if (!loading && mode === 'manual') {
      inputRef.current?.focus();
    }
  }, [loading, mode]);

  const processScan = async (codeToScan) => {
    if (!codeToScan.trim() || loading) return;

    setLoading(true);
    setResult(null);

    let extractedCode = codeToScan.trim();
    // If the scanner reads a full URL from the QR code, extract the last segment
    if (extractedCode.includes('/')) {
      const parts = extractedCode.split('/');
      extractedCode = parts[parts.length - 1];
    }

    try {
      const { data } = await api.post('/checklogs/scan', { passCode: extractedCode.toUpperCase() });

      if (data.action === 'OTP_REQUIRED') {
        setScannedPassCode(data.passCode);
        setSmsStatus({ sent: data.smsSent, message: data.message, devOtp: data.devOtp });
        setOtpMode(true);
        return; // Don't show result yet, wait for OTP
      }

      setResult({
        type: 'success',
        action: data.action, // 'CHECK_IN' or 'CHECK_OUT'
        message: data.message
      });
      setPassCode(''); // Clear input for next scan
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'Cryptographic Verification Failed'
      });
    } finally {
      if (!otpMode) {
         setLoading(false);
      }
      // Auto-clear result after 5 seconds to keep dashboard clean
      setTimeout(() => setResult(null), 5000);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim() || loading) return;

    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post('/checklogs/verify-otp', { 
        passCode: scannedPassCode, 
        otp 
      });
      
      setResult({
        type: 'success',
        action: data.action,
        message: data.message
      });
      setOtpMode(false);
      setOtp('');
      setScannedPassCode('');
      setPassCode('');
      setSmsStatus(null);
    } catch (err) {
      setResult({
        type: 'error',
        message: err.response?.data?.message || 'OTP Verification Failed'
      });
    } finally {
      setLoading(false);
      setTimeout(() => setResult(null), 5000);
    }
  };

  const handleManualScan = (e) => {
    e.preventDefault();
    processScan(passCode);
  };

  const handleCameraScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      if (code) {
        processScan(code);
      }
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl"
      >
        <div className="glass-panel p-1 rounded-[2rem] shadow-2xl overflow-hidden relative">
          {/* Cyberpunk accent lines */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
          <div className="absolute bottom-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
          
          <div className="bg-slate-900/80 rounded-[1.8rem] overflow-hidden">
            {/* Header */}
            <div className="px-8 py-8 border-b border-slate-700/50 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[2px]" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-24 -right-24 w-48 h-48 border border-indigo-500/20 rounded-full border-dashed"
              />
              
              <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 relative z-10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <ScanFace className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-widest uppercase relative z-10">Checkpoint Alpha</h2>
              <p className="text-cyan-400/80 mt-2 text-sm font-mono tracking-widest relative z-10">AWAITING SCAN PAYLOAD // INPUT READY</p>
            </div>

            {/* Mode Toggles */}
            <div className="flex justify-center gap-4 pt-6 relative z-10">
              <button 
                type="button"
                onClick={() => setMode('camera')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm tracking-widest transition-all ${mode === 'camera' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <Camera className="w-4 h-4" /> WEBCAM
              </button>
              <button 
                type="button"
                onClick={() => setMode('manual')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm tracking-widest transition-all ${mode === 'manual' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <Keyboard className="w-4 h-4" /> MANUAL
              </button>
            </div>

            {/* Scanner Body */}
            <div className="p-8 pb-12 relative z-10">
              {otpMode ? (
                <form onSubmit={handleOtpVerify} className="space-y-8 min-h-[250px] flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <ShieldCheck className="w-12 h-12 text-cyan-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold text-white tracking-widest uppercase">MFA Required</h3>
                    {smsStatus?.sent === false ? (
                      <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
                        <p>SMS delivery failed. {smsStatus.message}</p>
                        {smsStatus.devOtp && (
                          <p className="mt-1 font-mono text-lg font-bold tracking-widest text-amber-300">
                            DEV OTP: {smsStatus.devOtp}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">Enter the OTP sent to visitor's registered mobile number</p>
                    )}
                  </div>
                  <div className="relative group max-w-sm mx-auto w-full">
                    <input
                      type="text"
                      placeholder="6-DIGIT OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      className="w-full text-center text-4xl tracking-[0.4em] px-4 py-5 bg-slate-950/80 border-2 border-indigo-500/50 rounded-2xl text-cyan-400 placeholder:text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 focus:outline-none uppercase transition-all shadow-inner font-mono"
                      autoComplete="off"
                      autoFocus
                    />
                  </div>

                  <div className="flex justify-center gap-4">
                    <button
                      type="button"
                      onClick={() => { setOtpMode(false); setOtp(''); setLoading(false); setSmsStatus(null); }}
                      className="px-6 py-4 rounded-xl font-bold text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800 transition-all"
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      disabled={loading || otp.length < 4}
                      className="relative group overflow-hidden px-10 py-4 rounded-xl font-bold tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10 flex items-center gap-3">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                        <span>VERIFY OTP</span>
                      </div>
                    </button>
                  </div>
                </form>
              ) : mode === 'manual' ? (
                <form onSubmit={handleManualScan} className="space-y-8 min-h-[250px] flex flex-col justify-center">
                  <div className="relative group max-w-sm mx-auto w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                      <KeyRound className="w-6 h-6" />
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="e.g. 8F2A1C90B"
                      value={passCode}
                      onChange={(e) => setPassCode(e.target.value)}
                      className="w-full text-center text-2xl tracking-[0.2em] pl-12 pr-4 py-5 bg-slate-950/80 border-2 border-slate-700/50 rounded-2xl text-white placeholder:text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 focus:outline-none uppercase transition-all shadow-inner font-mono"
                      autoComplete="off"
                    />
                    {/* Scanning Laser Line Animation */}
                    <motion.div 
                      animate={{ top: ['10%', '90%', '10%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-2 right-2 h-0.5 bg-cyan-400 opacity-30 shadow-[0_0_8px_#22d3ee] pointer-events-none rounded-full"
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      type="submit"
                      disabled={loading || !passCode.trim()}
                      className="relative group overflow-hidden px-10 py-4 rounded-xl font-bold tracking-widest text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {/* Background glow layer */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-cyan-600 opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                      
                      <div className="relative z-10 flex items-center gap-3">
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>DECRYPTING...</span>
                          </>
                        ) : (
                          <>
                            <ScanLine className="w-5 h-5" />
                            <span>EXECUTE SCAN</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="w-full max-w-sm mx-auto overflow-hidden rounded-2xl border-2 border-cyan-500/30 relative min-h-[250px] bg-black">
                  {loading && (
                    <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                       <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
                       <span className="text-cyan-400 font-bold tracking-widest animate-pulse">DECRYPTING...</span>
                    </div>
                  )}
                  {/* Camera Scanner Viewport */}
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <motion.div 
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                      className="absolute w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                    />
                  </div>
                  <Scanner onScan={handleCameraScan} formats={["qr_code"]} styles={{ container: { width: '100%', height: '100%', objectFit: 'cover' } }} />
                </div>
              )}

              {/* Status Output Modal */}
              <AnimatePresence>
                {result && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`mt-6 p-6 rounded-2xl border-2 text-center relative overflow-hidden ${
                      result.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/30' 
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    {/* Background pulse */}
                    <motion.div 
                      animate={{ opacity: [0.1, 0.3, 0.1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`absolute inset-0 ${
                        result.type === 'success' ? 'bg-emerald-500/10' : 'bg-red-500/10'
                      }`}
                    />

                    <div className="relative z-10 flex flex-col items-center">
                      <div className={`p-4 rounded-full mb-4 ${
                        result.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {result.type === 'success' ? (
                          result.action === 'CHECK_IN' ? <DoorOpen className="w-10 h-10" /> : <DoorClosed className="w-10 h-10" />
                        ) : (
                          <AlertTriangle className="w-10 h-10" />
                        )}
                      </div>
                      
                      <h3 className={`text-2xl font-black uppercase tracking-wider mb-2 ${
                        result.type === 'success' ? 'text-emerald-400' : 'text-red-500'
                      }`}>
                        {result.type === 'success' 
                          ? (result.action === 'CHECK_IN' ? 'ACCESS GRANTED' : 'SUBJECT DEPARTED') 
                          : 'ACCESS DENIED'}
                      </h3>
                      
                      <p className={`font-mono text-sm tracking-wide bg-black/40 px-4 py-2 rounded-lg ${
                        result.type === 'success' ? 'text-emerald-300' : 'text-red-300'
                      }`}>
                        {result.message}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SecurityScanner;
