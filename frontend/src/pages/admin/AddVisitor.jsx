import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Save, AlertCircle, Building2, Phone, Mail, User, Camera, X } from 'lucide-react';

const AddVisitor = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });
  // Store the photo as a base64 string so we can send it to the backend
  const [photoBase64, setPhotoBase64] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // When the user picks a photo, convert it to base64 and show a preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, etc.)');
      return;
    }

    // Limit file size to 2MB
    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError('Photo size must be under 2MB. Please choose a smaller image.');
      return;
    }

    setError(null);

    // Use FileReader to convert the image to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result is the full base64 data URL string
      setPhotoBase64(reader.result);
      setPhotoPreview(reader.result);
      console.log("Photo converted to base64 successfully");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoBase64(null);
    setPhotoPreview(null);
    // Reset the file input so the user can pick the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build the payload - include photo if one was selected
    const payload = { ...formData };
    if (photoBase64) {
      payload.photo = photoBase64;
    }

    try {
      await api.post('/visitors', payload);
      navigate('/admin/visitors');
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while registering visitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/visitors" className="p-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400 tracking-tight">Register New Visitor</h1>
          <p className="text-slate-400 text-sm mt-1">Fill in the visitor details and optionally upload a photo ID.</p>
        </div>
      </div>

      <div className="glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden">
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-6 relative z-10">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">

          {/* Photo Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Visitor Photo (Optional)</label>
            <div className="flex items-center gap-6">
              {/* Photo preview circle */}
              <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center overflow-hidden shrink-0">
                {photoPreview ? (
                  <img src={photoPreview} alt="Visitor" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-600" />
                )}
              </div>

              <div className="flex flex-col gap-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 rounded-xl text-slate-300 text-sm cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4" />
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-red-400 text-sm transition-all"
                  >
                    <X className="w-4 h-4" />
                    Remove Photo
                  </button>
                )}
                <p className="text-xs text-slate-500">JPG, PNG up to 2MB</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Full Name *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  className="premium-input pl-11 bg-slate-900/60"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  className="premium-input pl-11 bg-slate-900/60"
                  placeholder="john.doe@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Phone Number *</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                  className="premium-input pl-11 bg-slate-900/60"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Company / Organization</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <input
                  type="text" name="company" value={formData.company} onChange={handleChange}
                  className="premium-input pl-11 bg-slate-900/60"
                  placeholder="Acme Corp (optional)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Address / Notes (Optional)</label>
            <textarea
              name="address" value={formData.address} onChange={handleChange} rows="3"
              className="premium-input bg-slate-900/60 resize-none h-28"
              placeholder="Home address or any relevant notes..."
            ></textarea>
          </div>

          <div className="pt-6 border-t border-slate-700/50 flex justify-end gap-4">
            <Link
              to="/admin/visitors"
              className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="premium-btn premium-btn-primary px-8"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Register Visitor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default AddVisitor;
