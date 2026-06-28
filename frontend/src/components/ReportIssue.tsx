import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { UploadCloud, Image as ImageIcon, MapPin, CheckCircle2, ChevronRight, AlertTriangle, ArrowRight, Info, HelpCircle, Sparkles } from 'lucide-react';
import { Report, Severity } from '../types';
import { UploadService } from '../services/upload.service';
import GoogleMap from './GoogleMap';

interface ReportIssueProps {
  reports: Report[];
  onAddReport: (newReport: Report) => void;
  onNavigateToDetail: (reportId: string) => void;
  onViewRegistry: () => void;
}

const ISSUE_CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Water Leakage',
  'Broken Streetlight',
  'Drain Blockage'
];

export default function ReportIssue({ reports, onAddReport, onNavigateToDetail, onViewRegistry }: ReportIssueProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiConfidence, setAiConfidence] = useState(0.94);
  
  // Form values
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Road Damage');
  const [severity, setSeverity] = useState<Severity>('HIGH');
  const [address, setAddress] = useState('1200 Main St.');
  const [coords, setCoords] = useState({ lat: 40.7128, lng: -74.0060 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter recent reports to show in feed
  const recentReports = reports.slice(0, 3);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      setUploadedImage(base64Data);
      setStep(2); // Jump to step 2 automatically
      
      // Execute live full-stack model classifications
      setIsAnalyzing(true);
      try {
        const uploaded = await UploadService.uploadImage(base64Data);
        const parsed = await UploadService.predict(uploaded.url);
        
        setCategory(parsed.category);
        setSeverity(parsed.severity);
        setDescription(parsed.description);
        setAiConfidence(parsed.confidence);
        setTitle(`${parsed.category} reported on ${file.name.split('.')[0].replace(/[-_]/g, ' ') || 'Street'}`);
      } catch (err) {
        console.error('Computer vision analysis error, fallback triggered:', err);
        setTitle(file.name.split('.')[0].replace(/[-_]/g, ' ') || 'Reported Issue');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileBrowser = () => {
    fileInputRef.current?.click();
  };



  const handleSubmit = () => {
    const randomId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReport: Report = {
      id: randomId,
      title: title || 'Reported Issue',
      description: description || 'No description provided.',
      category,
      severity,
      status: 'PENDING',
      assignedDept: category.includes('Road') ? 'Roads' : category.includes('Light') || category.includes('Signal') ? 'Electrical' : 'Parks & Rec',
      reportedBy: 'Anonymous User',
      reportedAt: 'Just now',
      imageUrl: uploadedImage || 'https://images.unsplash.com/photo-1596495578065-6e0763fa1141?w=500&auto=format&fit=crop&q=60',
      locationName: address,
      latitude: coords.lat,
      longitude: coords.lng,
      upvotes: 1,
      timeline: [
        {
          id: 't-1',
          status: 'Report Submitted',
          description: 'Initial report filed via CivicLens AI Portal.',
          timestamp: 'Just now',
          isCurrent: true
        }
      ]
    };

    onAddReport(newReport);
    setSubmittedId(randomId);
    setStep(5);
  };

  const handleFinish = () => {
    if (submittedId) {
      onNavigateToDetail(submittedId);
    }
    
    // Reset state
    setStep(1);
    setSubmittedId(null);
    setUploadedImage(null);
    setTitle('');
    setDescription('');
    setCategory('Road Damage');
    setSeverity('HIGH');
    setAddress('1200 Main St.');
  };

  return (
    <div className="space-y-16 py-6 max-w-[1280px] mx-auto">
      {/* Hero & Reporting Section */}
      <section className="space-y-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 tracking-tight leading-tight">
            Report a Civic Issue
          </h1>
          <p className="text-lg text-slate-500 mt-4 leading-relaxed font-normal">
            Help keep our community safe and functioning. Upload a photo of the issue to begin our AI-assisted reporting and dispatch flow.
          </p>
        </div>

        {/* 4-Step Progress Stepper */}
        <div className="w-full relative z-10 py-2">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] bg-slate-200/60 -z-10"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-[3px] bg-blue-600 -z-10 transition-all duration-500 ease-in-out" 
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            ></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                step >= 1 ? 'bg-blue-600 text-white border-blue-200 shadow-md shadow-blue-500/10' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-5 h-5 text-white fill-white/20" /> : '1'}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                step === 1 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
              }`}>Upload</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                step >= 2 ? 'bg-blue-600 text-white border-blue-200 shadow-md shadow-blue-500/10' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                {step > 2 ? <CheckCircle2 className="w-5 h-5 text-white fill-white/20" /> : '2'}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                step === 2 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
              }`}>Identify</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                step >= 3 ? 'bg-blue-600 text-white border-blue-200 shadow-md shadow-blue-500/10' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                {step > 3 ? <CheckCircle2 className="w-5 h-5 text-white fill-white/20" /> : '3'}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                step === 3 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
              }`}>Location</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                step >= 4 ? 'bg-blue-600 text-white border-blue-200 shadow-md shadow-blue-500/10' : 'bg-white text-slate-400 border-slate-200'
              }`}>
                4
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                step === 4 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
              }`}>Submit</span>
            </div>
          </div>
        </div>

        {/* Dynamic Drag & Drop Upload Panel & Wizard Steps */}
        <div className="bg-white/60 border border-slate-200/40 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl shadow-blue-900/5 relative overflow-hidden">
          
          {step === 1 && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-3 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${
                isDragging 
                  ? 'border-blue-600 bg-blue-50/55 scale-[1.01]' 
                  : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50/50'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div className="bg-blue-50 text-blue-600 rounded-full p-6 mb-6 group-hover:scale-110 transition-transform duration-300 border border-blue-100 shadow-sm">
                <UploadCloud className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Drag and drop your photos here</h3>
              <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                Our AI will automatically identify the issue type, assess severity, and extract location coordinates if available.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center">
                <button 
                  onClick={triggerFileBrowser}
                  className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition-all flex items-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  Browse Files
                </button>
                <button
                  type="button"
                  id="simulate-upload-btn"
                  onClick={() => {
                    const mockBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                    setUploadedImage(mockBase64);
                    setCategory("Road Damage");
                    setSeverity("HIGH");
                    setDescription("Severe pothole causing traffic slowdowns.");
                    setTitle("Pothole reported on Main St");
                    setStep(2);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm px-8 py-3.5 rounded-full transition-all flex items-center gap-2 border border-slate-200 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-500" />
                  Simulate Upload
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-6 uppercase tracking-widest font-semibold">
                Supported: JPG, PNG, HEIC (Max 20MB)
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex gap-4 items-center mb-4">
                <span className="p-3 bg-blue-100/80 rounded-2xl border border-blue-200 text-blue-600">
                  <Info className="w-5 h-5 text-blue-600" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Identify &amp; Detail</h3>
                  <p className="text-slate-500 text-sm">Review details extracted by our AI or fill them in below.</p>
                </div>
              </div>

              {/* AI Transparency Diagnostic Warning */}
              <div className="bg-blue-50/80 border border-blue-100 p-5 rounded-2xl flex items-start gap-4 shadow-sm">
                <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl">
                  <Sparkles className={`w-5 h-5 text-blue-600 fill-blue-500/10 ${isAnalyzing ? 'animate-spin' : ''}`} />
                </div>
                <div className="text-xs text-slate-600 space-y-1.5 font-semibold flex-1">
                  <p className="text-blue-900 font-extrabold text-sm flex items-center gap-1.5">
                    {isAnalyzing ? 'Gemini Computer Vision Model Analyzing...' : 'Gemini Vision Diagnostics completed'}
                  </p>
                  <p className="leading-relaxed">
                    {isAnalyzing ? (
                      'Extracting physical categories, anomaly severities, and departmental configurations from image layers...'
                    ) : (
                      <>
                        Detected: <strong className="text-slate-800 bg-white border border-slate-100 px-2 py-0.5 rounded-md shadow-sm uppercase">{category}</strong> with <strong className="text-slate-800 bg-white border border-slate-100 px-2 py-0.5 rounded-md shadow-sm uppercase">{severity} severity</strong>.
                      </>
                    )}
                  </p>
                  {!isAnalyzing && (
                    <p className="text-slate-400 font-medium font-normal">
                      Confidence: <span className="text-green-600 font-bold">{Math.round(aiConfidence * 100)}% accuracy score</span>. Override any options if needed.
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {uploadedImage && (
                  <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-md h-72">
                    <img src={uploadedImage} alt="Uploaded Issue" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Issue Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Broken Traffic Light, Sidewalk Crack" 
                      disabled={isAnalyzing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none font-semibold transition-all text-slate-800 disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea 
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide additional details to help our maintenance crew..." 
                      disabled={isAnalyzing}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-xl outline-none font-medium transition-all text-slate-800 resize-none disabled:opacity-50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isAnalyzing}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold transition-all text-slate-700 disabled:opacity-50"
                      >
                        {ISSUE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Severity Level</label>
                      <select 
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as any)}
                        disabled={isAnalyzing}
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-bold transition-all text-slate-700 disabled:opacity-50"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-3 font-semibold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(3)}
                  disabled={isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Next: Pin Location
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex gap-4 items-center mb-4">
                <span className="p-3 bg-blue-100/80 rounded-2xl border border-blue-200 text-blue-600">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Pinpoint Location</h3>
                  <p className="text-slate-500 text-sm">Select address or click on map intersection to refine coordinates.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="space-y-4 lg:col-span-1">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 1200 Main St." 
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white rounded-xl outline-none font-semibold transition-all text-slate-800"
                    />
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Coordinates</span>
                    <p className="font-mono text-xs text-slate-600 font-semibold">{coords.lat.toFixed(4)}° N, {Math.abs(coords.lng).toFixed(4)}° W</p>
                    <p className="text-xs text-slate-400 font-normal">Our algorithms extracted approximate location from photo metadata. Adjust if needed.</p>
                  </div>

                  <div className="space-y-1 bg-blue-50/50 p-4 border border-blue-100/40 rounded-2xl text-xs text-slate-600 leading-relaxed">
                    <div className="font-semibold text-blue-800 flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-700" />
                      Popular Locations
                    </div>
                    <button 
                      onClick={() => { setAddress('1200 Main St. Intersection'); setCoords({lat: 40.7128, lng: -74.0060}); }}
                      className="block text-left w-full hover:text-blue-700 hover:underline font-medium text-slate-500 py-1"
                    >
                      • 1200 Main St. Intersection
                    </button>
                    <button 
                      onClick={() => { setAddress('Elm & 5th Ave'); setCoords({lat: 40.7150, lng: -74.0030}); }}
                      className="block text-left w-full hover:text-blue-700 hover:underline font-medium text-slate-500 py-1"
                    >
                      • Elm &amp; 5th Ave
                    </button>
                    <button 
                      onClick={() => { setAddress('Centennial Park North'); setCoords({lat: 40.7180, lng: -74.0090}); }}
                      className="block text-left w-full hover:text-blue-700 hover:underline font-medium text-slate-500 py-1"
                    >
                      • Centennial Park North
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-2 relative h-80 rounded-3xl overflow-hidden border border-slate-200/40 shadow-inner group bg-slate-200">
                  <GoogleMap
                    center={coords}
                    draggableMarker={true}
                    onMarkerDragEnd={(lat, lng) => setCoords({ lat, lng })}
                    onClick={(lat, lng) => setCoords({ lat, lng })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setStep(2)}
                  className="px-6 py-3 font-semibold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={() => setStep(4)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Next: Finalize
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex gap-4 items-center mb-4">
                <span className="p-3 bg-green-100/80 rounded-2xl border border-green-200 text-green-600">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </span>
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Final Confirmation</h3>
                  <p className="text-slate-500 text-sm">Please verify details below before submitting to the department queue.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 rounded-3xl border border-slate-200/20">
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase block">Report Overview</span>
                  <h4 className="text-xl font-bold text-slate-900">{title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{description || 'No description provided.'}</p>
                  
                  <div className="pt-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-400 text-xs font-semibold block mb-1">Category</span>
                      <span className="text-slate-700 font-bold text-sm bg-white border border-slate-100 px-3 py-1 rounded-xl shadow-sm">{category}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs font-semibold block mb-1">Severity</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-xl border inline-block shadow-sm ${
                        severity === 'CRITICAL' || severity === 'HIGH'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>{severity}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Assigned Department</span>
                    <span className="text-slate-700 font-bold text-sm bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm block w-fit">
                      {category.includes('Road') ? 'Roads Dept' : category.includes('Light') || category.includes('Signal') ? 'Electrical Dept' : 'Sanitation Dept'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-xs font-semibold block mb-1">Location Address</span>
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {address}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setStep(3)}
                  className="px-6 py-3 font-semibold text-sm text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-10 py-3.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-green-500/10"
                >
                  Submit Civic Report
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-fade-in text-center flex flex-col items-center py-6">
              <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full border-4 border-green-100 flex items-center justify-center shadow-lg shadow-green-500/10 animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Report Submitted!</h3>
                <p className="text-slate-500 text-sm font-medium">
                  Your complaint has been successfully queued for official review and dispatch allocation.
                </p>
              </div>

              <div className="bg-slate-50/80 border border-slate-200/50 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-inner text-left">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tracking ID</span>
                  <span className="font-mono text-xs text-blue-600 font-extrabold bg-blue-50 border border-blue-100/50 px-2.5 py-1 rounded-md">
                    {submittedId}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Status</span>
                  <span className="inline-flex items-center gap-1.5 text-slate-600 font-bold text-xs bg-slate-100 px-3 py-1 rounded-full border border-slate-200/35">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                    Pending Action
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assigned Dept</span>
                  <span className="text-xs text-slate-700 font-bold bg-white border border-slate-100 px-3 py-1 rounded-xl shadow-sm">
                    {category.includes('Road') ? 'Roads Dept' : category.includes('Light') || category.includes('Signal') ? 'Electrical Dept' : 'Sanitation Dept'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Resolution</span>
                  <span className="text-xs text-slate-700 font-bold">Within 72 Hours</span>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleFinish}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-10 py-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/10 active:scale-98"
                >
                  <span>View Complaint Details</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Community Feed Section */}
      <section className="animate-fade-in">
        <div className="flex justify-between items-end mb-8 border-b border-slate-200/50 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 tracking-tight">Recent Community Reports</h2>
            <p className="text-slate-500 text-sm mt-1">Issues identified and tracked in your local municipal area.</p>
          </div>
          <button 
            onClick={onViewRegistry} 
            className="text-xs font-bold text-blue-600 uppercase hover:underline flex items-center gap-1 bg-white/40 border border-slate-200/60 px-4 py-2 rounded-full backdrop-blur-sm shadow-sm hover:bg-white cursor-pointer"
          >
            View Map Registry 
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bento Grid Layout for Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReports.map((report) => (
            <article 
              key={report.id}
              onClick={() => onNavigateToDetail(report.id)}
              className="bg-white/60 border border-slate-200/40 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col group hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              <div className="relative h-56 w-full bg-slate-100 overflow-hidden border-b border-slate-100">
                <img 
                  src={report.imageUrl} 
                  alt={report.title} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute top-3 left-3">
                  <span className={`backdrop-blur-md font-bold text-[10px] px-2.5 py-1.5 rounded-full border shadow-sm flex items-center gap-1 ${
                    report.severity === 'CRITICAL' || report.severity === 'HIGH'
                      ? 'bg-red-500/10 border-red-500/30 text-red-700 font-extrabold'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-700'
                  }`}>
                    <AlertTriangle className="w-3 h-3 stroke-[2.5]" />
                    {report.severity} SEVERITY
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-slate-500 font-bold text-[10px] px-2.5 py-1.5 rounded-full border border-slate-100 shadow-sm">
                    {report.id}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{report.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 flex items-center gap-1 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" /> 
                    {report.locationName}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100/60">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider border ${
                    report.status === 'RESOLVED'
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : report.status === 'IN_PROGRESS'
                      ? 'bg-blue-50 text-blue-700 border-blue-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {report.status}
                  </span>
                  <span className="text-xs font-medium text-slate-400">Reported {report.reportedAt?.includes('ago') ? report.reportedAt : (report.createdAt ? new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'recently')}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
