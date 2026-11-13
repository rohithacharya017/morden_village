import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useComplaints } from '../context/ComplaintContext';
import { COMPLAINT_CATEGORIES } from '../types';
import { classifyComplaintPriority } from '../services/aiClassifier';
import { getLiveGeolocation, reverseGeocodeLocation, getGoogleMapsUrl, getGoogleMapsEmbedUrl } from '../services/mapsService';
import { verifyComplaintImage, compressImageToDataUrl } from '../services/aiImageValidator';
import {
  validateProblemReport,
  SUBMISSION_THRESHOLD,
  ACCEPTED_MESSAGE,
  REJECTED_MESSAGE
} from '../services/aiProblemValidator';
import PriorityBadge from '../components/PriorityBadge';
import {
  Camera,
  Upload,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  Navigation,
  FileText,
  User,
  Phone,
  Zap,
  Droplet,
  Truck,
  Trash2,
  Building2,
  Waves,
  Sun,
  Trees,
  Dog,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Code,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Icon helper
function getCategoryIcon(name) {
  switch (name) {
    case 'Zap': return <Zap className="w-5 h-5 text-amber-500" />;
    case 'Droplet': return <Droplet className="w-5 h-5 text-blue-500" />;
    case 'Truck': return <Truck className="w-5 h-5 text-orange-500" />;
    case 'Trash2': return <Trash2 className="w-5 h-5 text-emerald-500" />;
    case 'Building2': return <Building2 className="w-5 h-5 text-red-500" />;
    case 'Waves': return <Waves className="w-5 h-5 text-cyan-500" />;
    case 'Sun': return <Sun className="w-5 h-5 text-yellow-500" />;
    case 'Trees': return <Trees className="w-5 h-5 text-green-500" />;
    case 'Dog': return <Dog className="w-5 h-5 text-purple-500" />;
    default: return <HelpCircle className="w-5 h-5 text-slate-500" />;
  }
}

export default function ReportProblemPage({ onNavigate, onSelectComplaint }) {
  const { currentUser } = useAuth();
  const { submitComplaint } = useComplaints();

  // Multi-step form state: 1 -> 2 -> 3 -> 4 (Review) -> 5 (Final Confirmation)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Data
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [villageName, setVillageName] = useState(currentUser?.village_name || 'Kandavara Gram Panchayat');

  // Geolocation
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // AI Classification & Image Verification Result
  const [aiClassification, setAiClassification] = useState(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [imageValidation, setImageValidation] = useState(null);
  const [isVerifyingImage, setIsVerifyingImage] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showValidationJson, setShowValidationJson] = useState(false);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  // Final Contact Confirmation
  const [confirmName, setConfirmName] = useState(currentUser?.full_name || '');
  const [confirmMobile, setConfirmMobile] = useState(currentUser?.mobile_number || '');
  const [contactError, setContactError] = useState('');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const fileInputRef = useRef(null);

  // Step 1: Photo Handling with HTML5 Canvas Compression (Guarantees Permanent Storage)
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCompressingPhoto(true);
      setValidationError('');
      setImageValidation(null);
      try {
        setPhotoFile(file);
        // Compress and convert to permanent base64 Data URL so the image never disappears on logout or refresh
        const permanentDataUrl = await compressImageToDataUrl(file, 1024, 1024, 0.85);
        setPhotoUrl(permanentDataUrl);
      } catch (err) {
        console.warn('Canvas compression failed, falling back to FileReader:', err);
        const reader = new FileReader();
        reader.onload = () => setPhotoUrl(reader.result);
        reader.readAsDataURL(file);
      } finally {
        setIsCompressingPhoto(false);
      }
    }
  };

  const removePhoto = () => {
    setPhotoUrl(null);
    setPhotoFile(null);
    setImageValidation(null);
    setValidationError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Step 1: Live Geolocation & Google Maps Reverse Geocoding
  const handleGetLocation = async () => {
    setIsLocating(true);
    setLocationError('');

    try {
      const geo = await getLiveGeolocation();
      // Reverse geocode via Google Maps API (with free open fallback)
      const geocode = await reverseGeocodeLocation(geo.latitude, geo.longitude);

      setLocation({
        latitude: geo.latitude,
        longitude: geo.longitude,
        accuracy: geo.accuracy,
        address: geocode.formattedAddress,
        source: geocode.source,
        googleMapsUrl: getGoogleMapsUrl(geo.latitude, geo.longitude),
        embedUrl: getGoogleMapsEmbedUrl(geo.latitude, geo.longitude)
      });
    } catch (err) {
      setLocationError(err.message || 'Unable to retrieve location coordinates.');
    } finally {
      setIsLocating(false);
    }
  };

  // Move to Step 4 & Run AI Problem Validation System + Priority Triage
  const handleProceedToReview = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in both the problem title and description before reviewing.');
      return;
    }

    if (!photoUrl) {
      alert('Civic verification requires photographic evidence. Please take or upload a photo in Step 1.');
      setCurrentStep(1);
      return;
    }

    setIsVerifyingImage(true);
    setValidationError('');

    try {
      // 1. AI-Based Problem Validation System:
      // Analyzes the uploaded photograph, extracts keywords/objects/conditions,
      // and calculates semantic similarity against Problem Title & Description.
      const validation = await validateProblemReport({
        imageBase64: photoUrl,
        category: selectedCategory?.name || 'Other',
        title,
        description
      });

      setImageValidation(validation);

      // STRICT SUBMISSION RULE:
      // Submit the problem report only if image content is meaningfully related
      // to both Problem Title and Problem Description. Similarity score must be >= 70%.
      if (validation.status === 'rejected' || validation.similarity_score < SUBMISSION_THRESHOLD) {
        setValidationError(validation.message || REJECTED_MESSAGE);
        setIsVerifyingImage(false);
        return; // HALT! Do not submit or proceed! Display rejection error.
      }

      // 2. If valid (accepted, similarity >= 70%):
      setIsClassifying(true);
      setCurrentStep(4);

      const result = await classifyComplaintPriority({
        category: selectedCategory?.name || 'Other',
        title,
        description
      });
      setAiClassification(result);
    } catch (err) {
      console.warn('AI validation check error:', err);
      setValidationError('AI problem validation failed to complete. Please retry.');
    } finally {
      setIsVerifyingImage(false);
      setIsClassifying(false);
    }
  };

  // Final Submission
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setContactError('');

    const cleanedMobile = confirmMobile.replace(/[\s\-\+]/g, '');
    const mobileRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[6789]\d{9}$/;
    if (!confirmMobile || !mobileRegex.test(cleanedMobile)) {
      setContactError('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    if (!confirmName.trim()) {
      setContactError('Please enter your full name');
      return;
    }

    // STRICT CHECK: Double-verify that the problem report is accepted before saving
    if (!imageValidation || imageValidation.status !== 'accepted' || imageValidation.similarity_score < SUBMISSION_THRESHOLD) {
      setContactError(REJECTED_MESSAGE);
      setValidationError(REJECTED_MESSAGE);
      setCurrentStep(3);
      return;
    }

    setIsSubmitting(true);
    try {
      const newRecord = await submitComplaint({
        title,
        description,
        category: selectedCategory?.name || 'Other',
        image_url: photoUrl || '/assets/hero-village.jpg',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        location_address: location?.address || villageName,
        village_name: villageName || 'Kandavara Gram Panchayat',
        reporter_name_snapshot: confirmName,
        reporter_mobile_snapshot: confirmMobile,
        priority: aiClassification?.priority || 'MEDIUM',
        priority_reason: aiClassification?.reason || 'Standard community triage priority.',
        priority_source: aiClassification?.source || 'Contextual Rules',
        google_maps_url: location?.googleMapsUrl || (location?.latitude ? getGoogleMapsUrl(location.latitude, location.longitude) : null),
        ai_validation_status: imageValidation.status,
        similarity_score: imageValidation.similarity_score,
        extracted_keywords: imageValidation.extracted_keywords,
        ai_validation_message: imageValidation.message
      });

      setSubmittedComplaint(newRecord);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch (err) {
      setContactError(err.message || 'Failed to lodge complaint. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-left">
      {/* Top Breadcrumb & Step Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              if (currentStep > 1) setCurrentStep(currentStep - 1);
              else onNavigate('villager_dashboard');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? 'Back to Dashboard' : 'Previous Step'}</span>
          </button>
          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Step {currentStep} of 4: {currentStep === 1 ? 'Photograph & Location' : currentStep === 2 ? 'Select Category' : currentStep === 3 ? 'Problem Details' : 'Review & Confirm'}
          </span>
        </div>

        {/* Progress track */}
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* SUCCESS MODAL (Rendered when submitted) */}
      {submittedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 text-center animate-fade-in space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest block mb-1">
                COMPLAINT LODGED
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                Problem report submitted successfully.
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Your photograph and complaint details were verified by AI and recorded on the Gram Panchayat ledger.
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Complaint Number:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">
                  {submittedComplaint.complaint_number}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">AI Problem Validation:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                  Accepted ({submittedComplaint.similarity_score || imageValidation?.similarity_score || 85}% Match)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">AI Priority:</span>
                <PriorityBadge priority={submittedComplaint.priority} />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Status:</span>
                <span className="font-semibold text-slate-800">Pending Panchayat Review</span>
              </div>

              {submittedComplaint.extracted_keywords && submittedComplaint.extracted_keywords.length > 0 && (
                <div className="pt-2 border-t border-slate-200 text-left">
                  <span className="text-[10px] font-bold text-slate-400 block mb-1">
                    Verified Visual Keywords from Photograph:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {submittedComplaint.extracted_keywords.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-md text-[10px] font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              You will receive an in-app and SMS alert as soon as an official acknowledges your ticket.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  onSelectComplaint(submittedComplaint.id);
                  onNavigate('villager_dashboard');
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                View Complaint Progress
              </button>
              <button
                onClick={() => onNavigate('villager_dashboard')}
                className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 1: CAPTURE A PHOTOGRAPH & GEOLOCATION */}
      {/* ==================================================================== */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-8 animate-fade-in">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Step 1: Capture Problem Photo & Location
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Photographic evidence and GPS coordinates help Panchayat engineers locate and verify the issue faster.
            </p>
          </div>

          {/* Large Camera Card */}
          <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 sm:p-8 bg-slate-50/70 text-center hover:border-emerald-500 transition group">
            {photoUrl ? (
              <div className="space-y-4">
                <div className="max-w-md mx-auto aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-md relative group">
                  <img src={photoUrl} alt="Captured Problem" className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake / Change Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-800 text-lg">Capture Problem Photo</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Take a picture of the broken streetlight, water leakage, or pothole directly with your phone camera, or upload an image.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera / Upload</span>
                  </button>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>

          {/* Geolocation Section with Google Maps Integration */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Live Location (Google Maps)</h4>
                  <p className="text-[11px] text-slate-500">
                    Capture your live approximate or exact GPS coordinates and landmark address.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                <span>{isLocating ? 'Detecting Live GPS...' : 'Detect Live Location'}</span>
              </button>
            </div>

            {location && (
              <div className="space-y-2.5 animate-fade-in">
                <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between flex-wrap gap-2 text-xs text-emerald-900">
                  <div className="space-y-0.5">
                    <div>
                      <strong className="text-emerald-950">Live Address:</strong> {location.address}
                    </div>
                    {location.accuracy && (
                      <div className="text-[11px] text-emerald-700 font-medium">
                        Accuracy: <span className="font-mono font-bold">±{location.accuracy}m</span> (High Precision Live GPS)
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-200/90 text-emerald-800 px-2.5 py-1 rounded-full font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Live GPS Tagged
                    </span>
                    {location.googleMapsUrl && (
                      <a
                        href={location.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-white px-2.5 py-1 rounded-lg border border-blue-200 hover:bg-blue-50 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Google Maps</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Interactive Map Preview */}
                {location.embedUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 aspect-21/9 max-h-48 w-full shadow-inner bg-slate-100">
                    <iframe
                      title="Google Maps Live Location Pin"
                      src={location.embedUrl}
                      className="w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            )}

            {locationError && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>{locationError}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
            >
              <span>Next: Select Category</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 2: SELECT PROBLEM CATEGORY */}
      {/* ==================================================================== */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Step 2: Select Problem Category
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select the option that best describes the civic amenity or public issue.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {COMPLAINT_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition flex items-start gap-3.5 ${isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-100'
                    : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                  >
                    {getCategoryIcon(cat.iconName)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">{cat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Back
            </button>
            <button
              type="button"
              disabled={!selectedCategory}
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-40"
            >
              <span>Next: Enter Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 3: ENTER PROBLEM DETAILS */}
      {/* ==================================================================== */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Step 3: Enter Problem Details
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Provide clear information about what happened, where it happened, and the impact on villagers.
            </p>
          </div>

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Problem Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Streetlight not working near the primary school"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                A short, meaningful summary of the problem.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                About the Problem <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what happened, where it happened, and how it affects people. For example: The streetlight near the government school has not worked for five days. The road is dark at night, making it difficult for students and residents to walk safely."
                className="w-full text-sm p-4 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none leading-relaxed"
                required
              />
            </div>

            {/* Nearby Gram Panchayat / Village Name (Optional) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Nearby Gram Panchayat / Village Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                placeholder="Enter nearby Gram Panchayat or village name"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                If skipped, the complaint will be routed to your registered village ward.
              </p>
            </div>

            {/* Location Review Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>
                  {location ? location.address : 'No GPS tag attached (you can describe the location in the text).'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-emerald-700 font-bold hover:underline"
              >
                Change Photo/Location
              </button>
            </div>

            {/* AI Vision Cross-Verification Scanner Bar */}
            {isVerifyingImage && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 animate-pulse text-emerald-900 text-xs font-semibold shadow-xs">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600 shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900">Multimodal AI Vision Cross-Checking Photograph...</p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Analyzing photo evidence against category "{selectedCategory?.name || 'Selected'}" and title "{title}".
                  </p>
                </div>
              </div>
            )}

            {/* AI Image Verification Mismatch Error Banner (STRICTLY BLOCKS SUBMISSION) */}
            {validationError && (
              <div className="p-6 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-4 text-rose-900 animate-fade-in shadow-md">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0" />
                    <div>
                      <h4 className="font-extrabold text-sm text-rose-900">
                        AI Problem Validation Failed: Mismatch Detected
                      </h4>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-rose-600">
                        Status: rejected • Similarity: {imageValidation?.similarity_score ?? 0}% (Required: ≥ 70%)
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-rose-200 text-rose-900 px-2.5 py-1 rounded-full">
                    Score: {imageValidation?.similarity_score ?? 0}% &lt; 70%
                  </span>
                </div>

                <div className="bg-white/90 p-4 rounded-xl border border-rose-200 text-xs text-rose-800 space-y-2">
                  <p className="font-semibold text-rose-950 leading-relaxed">
                    {validationError}
                  </p>

                  {imageValidation?.extracted_keywords && imageValidation.extracted_keywords.length > 0 && (
                    <div className="pt-2 border-t border-rose-100">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-rose-500" />
                        <span>Extracted Keywords from Photograph:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {imageValidation.extracted_keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-medium rounded-md border border-rose-200"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2">
                        These visual elements do not sufficiently match your problem title: <em>"{title}"</em>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Collapsible Raw JSON Response Inspector */}
                {imageValidation && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowValidationJson(!showValidationJson)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 hover:text-rose-950 transition"
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>{showValidationJson ? 'Hide AI Validation JSON' : 'View AI Validation JSON Schema'}</span>
                      {showValidationJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {showValidationJson && (
                      <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto shadow-inner border border-slate-800">
                        {JSON.stringify(
                          {
                            status: imageValidation.status || 'rejected',
                            extracted_keywords: imageValidation.extracted_keywords || [],
                            similarity_score: imageValidation.similarity_score ?? 0,
                            message: imageValidation.message || validationError
                          },
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-200/80">
                  <p className="text-[11px] text-rose-700 italic">
                    The report cannot be submitted with an unrelated photograph. Please upload relevant photo evidence.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Photograph in Step 1</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 transition"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleProceedToReview}
              disabled={isVerifyingImage}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {isVerifyingImage ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cross-Checking Photo...</span>
                </>
              ) : (
                <>
                  <span>Verify Photo & Review AI Priority</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STEP 4: REVIEW & CONFIRM (WITH AI PRIORITY RECOMMENDATION) */}
      {/* ==================================================================== */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-6 animate-fade-in">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Triage Inspection Complete</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Review Your Complaint
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Please inspect the complaint summary and the AI-recommended priority before confirming.
            </p>
          </div>

          {/* AI Priority Recommendation Card */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-300 rounded-2xl p-5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <span className="font-extrabold text-sm text-slate-900">
                  AI-Recommended Priority:
                </span>
                {isClassifying ? (
                  <span className="text-xs text-slate-500 animate-pulse font-semibold">
                    Analyzing safety threats...
                  </span>
                ) : (
                  <PriorityBadge priority={aiClassification?.priority || 'HIGH'} />
                )}
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {aiClassification?.source || 'Contextual Safety Model'}
              </span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-emerald-100">
              "{aiClassification?.reason || 'Calculated based on hazard context and infrastructure impact.'}"
            </p>
            <p className="text-[10px] text-slate-400">
              * Note: AI priority serves as a dispatch triage recommendation for Gram Panchayat officials.
            </p>
          </div>

          {/* AI Problem Validation Certificate Card */}
          {imageValidation && (
            <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-5 text-emerald-950 space-y-3 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="font-extrabold text-sm text-slate-900">
                    AI Problem Validation: Accepted ✓
                  </span>
                  <span className="text-[10px] font-extrabold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full uppercase">
                    Status: {imageValidation.status}
                  </span>
                </div>
                <span className="text-xs font-extrabold bg-emerald-600 text-white px-3 py-1 rounded-full shadow-xs">
                  Semantic Match: {imageValidation.similarity_score}% (≥ 70% Required)
                </span>
              </div>

              <div className="text-xs text-slate-700 bg-white/80 p-3.5 rounded-xl border border-emerald-100 space-y-2">
                <p className="font-semibold text-emerald-900">
                  {imageValidation.message || ACCEPTED_MESSAGE}
                </p>

                {imageValidation.extracted_keywords && imageValidation.extracted_keywords.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-600" />
                      <span>Extracted Visual Keywords:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {imageValidation.extracted_keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-medium rounded-md border border-emerald-200"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* View Validation JSON toggle */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowValidationJson(!showValidationJson)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showValidationJson ? 'Hide AI Validation JSON' : 'View AI Validation JSON Schema'}</span>
                  {showValidationJson ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showValidationJson && (
                  <pre className="mt-2 p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto shadow-inner border border-slate-800">
                    {JSON.stringify(
                      {
                        status: imageValidation.status || 'accepted',
                        extracted_keywords: imageValidation.extracted_keywords || [],
                        similarity_score: imageValidation.similarity_score ?? 85,
                        message: imageValidation.message || ACCEPTED_MESSAGE
                      },
                      null,
                      2
                    )}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Summary Box */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                  Category
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {selectedCategory?.name || 'Other'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                  Gram Panchayat / Village
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {villageName || 'Kandavara Gram Panchayat'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block">
                Problem Title
              </span>
              <h4 className="text-sm font-bold text-slate-900">{title}</h4>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                Problem Description
              </span>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap">
                {description}
              </p>
            </div>

            {/* Photo & Location Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Evidence Photo (Permanent Storage)
                </span>
                {photoUrl ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
                    <img src={photoUrl} alt="Problem Preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">No photograph uploaded</span>
                )}
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  Live GPS Location (Google Maps)
                </span>
                <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{location ? location.address : 'Described in text'}</span>
                  </div>
                  {location?.latitude && (
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">
                        GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} {location.accuracy ? `(±${location.accuracy}m)` : ''}
                      </span>
                      {location.googleMapsUrl && (
                        <a
                          href={location.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Google Maps</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Final Contact Confirmation Form */}
          <form onSubmit={handleFinalSubmit} className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Confirm Citizen Contact Details
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Please confirm your contact details so we can notify you about your complaint resolution.
              </p>
            </div>

            {contactError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{contactError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number (For SMS updates)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={confirmMobile}
                  onChange={(e) => setConfirmMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white focus:border-emerald-600 outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200 hover:bg-slate-100 transition"
              >
                Edit Details
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-700/20 transition flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Recording on Panchayat Ledger...</span>
                ) : (
                  <>
                    <span>Submit Complaint</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
