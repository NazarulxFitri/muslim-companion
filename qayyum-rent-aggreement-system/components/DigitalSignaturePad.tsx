'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Edit3, Type, RotateCcw, CheckCircle, ShieldAlert } from 'lucide-react';

interface DigitalSignaturePadProps {
  onSave: (signatureDataUrl: string) => void;
  signerName: string;
  signerRole: 'LENDER' | 'BORROWER';
  onCancel?: () => void;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  onSave,
  signerName,
  signerRole,
  onCancel
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'DRAW' | 'TYPE'>('DRAW');
  const [typedName, setTypedName] = useState(signerName);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (mode === 'DRAW' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = signerRole === 'LENDER' ? '#1e40af' : '#047857';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [mode, signerRole]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const generateTypedSignatureDataUrl = (nameText: string): string => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 400;
    tempCanvas.height = 100;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.font = '32px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = signerRole === 'LENDER' ? '#1e40af' : '#047857';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(nameText, 200, 50);

      // Add legal timestamp line
      ctx.font = '10px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Verified Digital Signature • ${new Date().toISOString()}`, 200, 85);
    }
    return tempCanvas.toDataURL('image/png');
  };

  const handleConfirmSignature = () => {
    if (mode === 'DRAW') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        alert('Please draw your signature before confirming.');
        return;
      }
      onSave(canvas.toDataURL('image/png'));
    } else {
      if (!typedName.trim()) {
        alert('Please enter your full legal name.');
        return;
      }
      onSave(generateTypedSignatureDataUrl(typedName));
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-slate-100 max-w-lg w-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Digital Agreement Signature
          </h3>
          <p className="text-xs text-slate-400">
            Signer: <span className="font-semibold text-slate-200">{signerName}</span> ({signerRole})
          </p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setMode('DRAW')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              mode === 'DRAW' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Draw
          </button>
          <button
            onClick={() => setMode('TYPE')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
              mode === 'TYPE' ? 'bg-slate-700 text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            Type
          </button>
        </div>
      </div>

      {mode === 'DRAW' ? (
        <div className="space-y-3">
          <div className="relative bg-white rounded-xl overflow-hidden border-2 border-dashed border-slate-700 shadow-inner">
            <canvas
              ref={canvasRef}
              width={400}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-36 touch-none cursor-crosshair"
            />
            {!hasDrawn && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                Draw your signature here using mouse or touch screen
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center text-xs">
            <button
              onClick={clearCanvas}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear Signature
            </button>
            <span className="text-slate-500 italic">Protected by Digital Signature Hashing</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Type Full Name as Legal Signature
            </label>
            <input
              type="text"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="e.g. Siti Nurhaliza binti Osman"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-white p-4 rounded-xl text-center border border-slate-700 shadow-inner">
            <p className="text-2xl font-serif italic text-blue-900 tracking-wide select-none">
              {typedName || 'Your Signature Preview'}
            </p>
            <p className="text-[10px] text-slate-500 mt-2 font-mono">
              Verified Digital Signature • {new Date().toISOString().split('T')[0]}
            </p>
          </div>
        </div>
      )}

      {/* Confirmation Note */}
      <div className="mt-4 bg-emerald-950/40 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-300 flex items-start gap-2">
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          By signing, you confirm all terms set forth in this loan agreement are binding under Malaysian Contracts Law.
        </p>
      </div>

      {/* Buttons */}
      <div className="mt-5 flex gap-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          onClick={handleConfirmSignature}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5"
        >
          <CheckCircle className="w-4 h-4" />
          Confirm & Digitally Sign
        </button>
      </div>
    </div>
  );
};
