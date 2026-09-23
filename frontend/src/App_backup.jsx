import { useState, useEffect, useRef } from 'react';
import {
  Tractor,
  IndianRupee,
  Clock,
  CheckCircle2,
  Plus,
  RefreshCw,
  LogOut,
  Trash2,
  MapPin,
  AlertCircle,
  X,
  ShieldCheck,
  Calendar,
  Pencil,
  ImagePlus,
  Eye,
  Info,
  Search,
  Filter,
  User,
  Phone,
  Check,
  ShoppingBag,
  UserCheck
} from 'lucide-react';
import {
  authLogin,
  authRegister,
  getOwnerDashboard,
  getCategories,
  addEquipment,
  deleteEquipment,
  updateEquipment,
  uploadEquipmentImage,
  getEquipmentDetails,
  browseEquipment,
  createBooking,
  getMyBookings,
  getOwnerBookings,
  updateBookingStatus,
} from './services/api';

const BACKEND_BASE = 'http://localhost:8080';

const EMPTY_FORM = {
  name: '',
  category: 'TRACTOR',
  description: '',
  pricePerDay: '',
  pricePerHour: '',
  location: '',
  city: '',
  state: '',
  pincode: '',
  specifications: '',
  availability: 'AVAILABLE',
  imageUrl: '',
};

const getTodayDate = () => new Date().toISOString().split('T')[0];
const getTomorrowDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export default function App() {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(() => localStorage.getItem('role') || '');
  const [userName, setUserName] = useState(() => localStorage.getItem('name') || '');

  // Auth form view state ('login' | 'register')
  const [authMode, setAuthMode] = useState('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState('FARMER');
  const [isRegistering, setIsRegistering] = useState(false);

  // Owner Dashboard state
  const [dashboard, setDashboard] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Owner Bookings state
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [isLoadingOwnerBookings, setIsLoadingOwnerBookings] = useState(false);

  // Add Equipment modal state (Owner)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  // Photo upload state (Add modal)
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef(null);

  // Edit Equipment modal state (Owner)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [editFormData, setEditFormData] = useState({ ...EMPTY_FORM });
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState('');
  const [isEditUploadingPhoto, setIsEditUploadingPhoto] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const editPhotoInputRef = useRef(null);

  // Equipment Details modal state
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsData, setDetailsData] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // ─── Farmer / Client State ───────────────────────────────────────────────
  const [activeFarmerTab, setActiveFarmerTab] = useState('browse'); // 'browse' | 'bookings'
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [farmerEquipment, setFarmerEquipment] = useState([]);
  const [isSearchingEquipment, setIsSearchingEquipment] = useState(false);

  // Farmer Bookings state
  const [farmerBookings, setFarmerBookings] = useState([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Book Now modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingEquipment, setBookingEquipment] = useState(null);
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTomorrowDate());
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const isAuthenticatedOwner = token && userRole === 'OWNER';
  const isAuthenticatedFarmer = token && userRole === 'FARMER';

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (isAuthenticatedOwner) {
      loadDashboard();
      loadOwnerBookings();
    } else if (isAuthenticatedFarmer) {
      loadFarmerEquipment();
      loadFarmerBookings();
    }
  }, [token, userRole]);

  const loadDashboard = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getOwnerDashboard();
      if (res.success) {
        setDashboard(res.data);
        if (res.data.bookingRequests) {
          setOwnerBookings(res.data.bookingRequests);
        }
        if (res.data.ownerName) {
          setUserName(res.data.ownerName);
          localStorage.setItem('name', res.data.ownerName);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load owner dashboard';
      setErrorMsg(msg);
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadOwnerBookings = async () => {
    setIsLoadingOwnerBookings(true);
    try {
      const res = await getOwnerBookings();
      if (res.success) {
        setOwnerBookings(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load owner bookings', err);
    } finally {
      setIsLoadingOwnerBookings(false);
    }
  };

  const handleOwnerBookingStatusUpdate = async (bookingId, newStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await updateBookingStatus(bookingId, newStatus);
      if (res.success) {
        setSuccessMsg(`Booking status updated to ${newStatus} successfully!`);
        loadOwnerBookings();
        loadDashboard();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update booking status.';
      setErrorMsg(msg);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      if (res.success) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  // ─── Farmer Equipment Browse ────────────────────────────────────────────
  const loadFarmerEquipment = async (overrideParams = null) => {
    setIsSearchingEquipment(true);
    setErrorMsg('');
    try {
      const params = overrideParams !== null ? overrideParams : {
        keyword: searchKeyword,
        category: selectedCategory,
        location: searchLocation,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      };
      const res = await browseEquipment(params);
      if (res.success) {
        setFarmerEquipment(res.data || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch equipment listings';
      setErrorMsg(msg);
    } finally {
      setIsSearchingEquipment(false);
    }
  };

  const loadFarmerBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const res = await getMyBookings();
      if (res.success) {
        setFarmerBookings(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch farmer bookings', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleFilterSearch = (e) => {
    if (e) e.preventDefault();
    loadFarmerEquipment();
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setSelectedCategory('');
    setSearchLocation('');
    setMaxPrice('');
    loadFarmerEquipment({ keyword: '', category: '', location: '', maxPrice: undefined });
  };

  // ─── Auth Handlers ──────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const res = await authLogin(loginEmail, loginPassword);
      if (res.success && res.data) {
        const { token: jwtToken, role, name } = res.data;
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);
        setToken(jwtToken);
        setUserRole(role);
        setUserName(name);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setAuthError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e) => {
    if (e) e.preventDefault();
    setIsRegistering(true);
    setAuthError('');
    setAuthSuccess('');
    try {
      const payload = {
        name: registerName,
        email: registerEmail,
        phone: registerPhone,
        password: registerPassword,
        role: registerRole,
      };
      const res = await authRegister(payload);
      if (res.success && res.data) {
        const { token: jwtToken, role, name } = res.data;
        setAuthSuccess(`Account created successfully! Logging you in as ${role}...`);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);
        setToken(jwtToken);
        setUserRole(role);
        setUserName(name);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setAuthError(msg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    setToken('');
    setUserRole('');
    setUserName('');
    setDashboard(null);
    setFarmerEquipment([]);
    setFarmerBookings([]);
    setOwnerBookings([]);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleQuickOwnerLogin = () => {
    setLoginEmail('suresh.owner@example.com');
    setLoginPassword('Password123!');
    setTimeout(() => {
      handleLogin();
    }, 50);
  };

  const handleQuickFarmerLogin = async () => {
    setIsLoggingIn(true);
    setAuthError('');
    const demoEmail = 'ramesh.farmer@example.com';
    const demoPassword = 'Password123!';

    try {
      const res = await authLogin(demoEmail, demoPassword);
      if (res.success && res.data) {
        const { token: jwtToken, role, name } = res.data;
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('role', role);
        localStorage.setItem('name', name);
        setToken(jwtToken);
        setUserRole(role);
        setUserName(name);
      }
    } catch (err) {
      // If demo farmer doesn't exist, auto register and log in
      try {
        const regRes = await authRegister({
          name: 'Ramesh Kumar',
          email: demoEmail,
          phone: '9876543210',
          password: demoPassword,
          role: 'FARMER',
        });
        if (regRes.success && regRes.data) {
          const { token: jwtToken, role, name } = regRes.data;
          localStorage.setItem('token', jwtToken);
          localStorage.setItem('role', role);
          localStorage.setItem('name', name);
          setToken(jwtToken);
          setUserRole(role);
          setUserName(name);
        }
      } catch (regErr) {
        setAuthError('Quick sign in failed. Please try standard login or registration.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  // ─── Owner Form Handlers ───────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const handleEditPhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditPhotoFile(file);
    setEditPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemoveEditPhoto = () => {
    setEditPhotoFile(null);
    setEditPhotoPreview('');
    setEditFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (editPhotoInputRef.current) editPhotoInputRef.current.value = '';
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let resolvedImageUrl = formData.imageUrl || '';

      if (photoFile) {
        setIsUploadingPhoto(true);
        try {
          const uploadRes = await uploadEquipmentImage(photoFile);
          if (uploadRes.success && uploadRes.data?.imageUrl) {
            resolvedImageUrl = uploadRes.data.imageUrl;
          }
        } finally {
          setIsUploadingPhoto(false);
        }
      }

      const payload = {
        ...formData,
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerHour: formData.pricePerHour ? parseFloat(formData.pricePerHour) : null,
        imageUrl: resolvedImageUrl || null,
      };

      const res = await addEquipment(payload);
      if (res.success) {
        setSuccessMsg(`"${res.data.name}" listed successfully!`);
        setIsModalOpen(false);
        resetAddModal();
        loadDashboard();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to list equipment.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAddModal = () => {
    setFormData({ ...EMPTY_FORM });
    setPhotoFile(null);
    setPhotoPreview('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const openEditModal = (item) => {
    setEditingEquipment(item);
    setEditFormData({
      name: item.name || '',
      category: item.category || 'TRACTOR',
      description: item.description || '',
      pricePerDay: item.pricePerDay || '',
      pricePerHour: item.pricePerHour || '',
      location: item.location || '',
      city: item.city || '',
      state: item.state || '',
      pincode: item.pincode || '',
      specifications: item.specifications || '',
      availability: item.availability || 'AVAILABLE',
      imageUrl: item.imageUrl || '',
    });
    setEditPhotoFile(null);
    setEditPhotoPreview(item.imageUrl ? BACKEND_BASE + item.imageUrl : '');
    setIsEditModalOpen(true);
  };

  const handleEditEquipment = async (e) => {
    e.preventDefault();
    setIsEditSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let resolvedImageUrl = editFormData.imageUrl || '';

      if (editPhotoFile) {
        setIsEditUploadingPhoto(true);
        try {
          const uploadRes = await uploadEquipmentImage(editPhotoFile);
          if (uploadRes.success && uploadRes.data?.imageUrl) {
            resolvedImageUrl = uploadRes.data.imageUrl;
          }
        } finally {
          setIsEditUploadingPhoto(false);
        }
      }

      const payload = {
        ...editFormData,
        pricePerDay: parseFloat(editFormData.pricePerDay),
        pricePerHour: editFormData.pricePerHour ? parseFloat(editFormData.pricePerHour) : null,
        imageUrl: resolvedImageUrl || null,
      };

      const res = await updateEquipment(editingEquipment.id, payload);
      if (res.success) {
        setSuccessMsg(`"${res.data.name}" updated successfully!`);
        setIsEditModalOpen(false);
        setEditingEquipment(null);
        loadDashboard();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update equipment.';
      setErrorMsg(msg);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // ─── Details Modal ───────────────────────────────────────────────────────
  const openDetailsModal = async (id) => {
    setIsDetailsModalOpen(true);
    setDetailsData(null);
    setIsLoadingDetails(true);
    try {
      const res = await getEquipmentDetails(id);
      if (res.success) {
        setDetailsData(res.data);
      }
    } catch (err) {
      console.error('Failed to load equipment details', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // ─── Book Now Modal ───────────────────────────────────────────────────────
  const openBookingModal = (item) => {
    setBookingEquipment(item);
    setStartDate(getTodayDate());
    setEndDate(getTomorrowDate());
    setBookingError('');
    setIsBookingModalOpen(true);
  };

  const calculateBookingDays = () => {
    if (!startDate || !endDate) return 1;
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diffTime = e - s;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  const handleCreateBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingEquipment) return;
    setIsSubmittingBooking(true);
    setBookingError('');
    try {
      const res = await createBooking({
        equipmentId: bookingEquipment.id,
        startDate: startDate,
        endDate: endDate,
      });
      if (res.success) {
        setSuccessMsg(`Booking request for "${bookingEquipment.name}" submitted successfully! Status: PENDING`);
        setIsBookingModalOpen(false);
        setIsDetailsModalOpen(false);
        setActiveFarmerTab('bookings');
        loadFarmerBookings();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      setBookingError(msg);
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  // ─── Owner Delete ────────────────────────────────────────────────────────
  const handleDeleteEquipment = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await deleteEquipment(id);
      if (res.success) {
        setSuccessMsg(res.message);
        loadDashboard();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete equipment.';
      setErrorMsg(msg);
    }
  };

  // ─── Photo dropzone component ─────────────────────────────────────────────
  const PhotoDropzone = ({ onFileSelect, inputRef }) => (
    <div
      className="photo-dropzone"
      onClick={() => inputRef.current && inputRef.current.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && inputRef.current && inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={onFileSelect}
      />
      <div className="photo-dropzone-icon"><ImagePlus size={30} /></div>
      <div className="photo-dropzone-text">Click to upload equipment photo</div>
      <div className="photo-dropzone-sub">JPG, PNG or WebP — max 10 MB</div>
    </div>
  );

  // ─── UNAUTHENTICATED: LOGIN & REGISTER VIEW ────────────────────────────────
  if (!token) {
    return (
      <div>
        <header className="app-header">
          <div className="header-container">
            <div className="brand">
              <div className="brand-icon">
                <Tractor size={22} />
              </div>
              <div className="brand-text">
                <h1>KhetRent</h1>
                <span>Agricultural Equipment Rental Platform</span>
              </div>
            </div>
            <div className="user-badge">
              <ShieldCheck size={16} />
              <span>Farmers & Owners Portal</span>
            </div>
          </div>
        </header>

        <div className="auth-wrapper">
          <div className="auth-card">
            {/* Auth Toggle Tabs */}
            <div className="auth-tabs">
              <button
                className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => { setAuthMode('login'); setAuthError(''); setAuthSuccess(''); }}
              >
                Sign In
              </button>
              <button
                className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => { setAuthMode('register'); setAuthError(''); setAuthSuccess(''); }}
              >
                Create Account
              </button>
            </div>

            {authError && <div className="alert alert-danger">{authError}</div>}
            {authSuccess && <div className="alert alert-success">{authSuccess}</div>}

            {authMode === 'login' ? (
              <>
                <div className="auth-header">
                  <h2>Welcome Back to KhetRent</h2>
                  <p>Log in with your Farmer or Owner account to get started</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <button
                    id="quick-farmer-login-btn"
                    type="button"
                    className="quick-login-btn"
                    onClick={handleQuickFarmerLogin}
                    disabled={isLoggingIn}
                  >
                    🚜 Quick Sign In as Farmer (Ramesh)
                  </button>
                  <button
                    id="quick-owner-login-btn"
                    type="button"
                    className="quick-login-btn"
                    style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}
                    onClick={handleQuickOwnerLogin}
                    disabled={isLoggingIn}
                  >
                    🚀 Quick Sign In as Owner (Suresh)
                  </button>
                </div>

                <div className="divider">or enter credentials</div>

                <form onSubmit={handleLogin}>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary-dark"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? 'Authenticating...' : 'Sign In'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="auth-header">
                  <h2>Join KhetRent Platform</h2>
                  <p>Register as a Farmer to rent machinery or as an Owner to earn income</p>
                </div>

                <form onSubmit={handleRegister}>
                  <div className="form-group">
                    <label>Account Type (Role)</label>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        <input
                          type="radio"
                          name="role"
                          value="FARMER"
                          checked={registerRole === 'FARMER'}
                          onChange={(e) => setRegisterRole(e.target.value)}
                        />
                        Farmer (Client)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 'bold' }}>
                        <input
                          type="radio"
                          name="role"
                          value="OWNER"
                          checked={registerRole === 'OWNER'}
                          onChange={(e) => setRegisterRole(e.target.value)}
                        />
                        Equipment Owner
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="ramesh@example.com"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone Number (10 Digits)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      placeholder="9876543210"
                      pattern="[0-9]{10}"
                      title="10 digit phone number"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Password (Min 6 chars)</label>
                    <input
                      type="password"
                      className="form-control"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
                    disabled={isRegistering}
                  >
                    {isRegistering ? 'Registering Account...' : 'Register Account'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── AUTHENTICATED: FARMER SIDE ───────────────────────────────────────────
  if (isAuthenticatedFarmer) {
    return (
      <div>
        {/* App Header */}
        <header className="app-header">
          <div className="header-container">
            <div className="brand">
              <div className="brand-icon">
                <Tractor size={22} />
              </div>
              <div className="brand-text">
                <h1>KhetRent</h1>
                <span>Farmer Equipment Portal</span>
              </div>
            </div>

            <div className="header-actions">
              <nav className="farmer-nav-tabs">
                <button
                  className={`nav-tab-btn ${activeFarmerTab === 'browse' ? 'active' : ''}`}
                  onClick={() => { setActiveFarmerTab('browse'); loadFarmerEquipment(); }}
                >
                  <Search size={16} />
                  <span>Browse Equipment</span>
                </button>
                <button
                  className={`nav-tab-btn ${activeFarmerTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => { setActiveFarmerTab('bookings'); loadFarmerBookings(); }}
                >
                  <ShoppingBag size={16} />
                  <span>My Bookings</span>
                </button>
              </nav>

              <div className="user-badge">
                <User size={15} />
                <span>{userName || 'Farmer'}</span>
                <span className="role-pill" style={{ background: '#dbeafe', color: '#1e40af' }}>FARMER</span>
              </div>
              <button className="btn btn-outline" onClick={handleLogout} title="Log Out">
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-container">
          {errorMsg && (
            <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeFarmerTab === 'browse' && (
            <>
              {/* Hero & Search Filter Bar */}
              <div className="filter-card">
                <form onSubmit={handleFilterSearch} className="filter-grid">
                  <div className="filter-group">
                    <label>Equipment Name / Keyword</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Tractor, Rotavator, Harvester..."
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Category</label>
                    <select
                      className="form-control"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat.name} value={cat.name}>
                          {cat.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Location / City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Pune, Nashik, Village..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Max Price Per Day (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 3000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>

                  <div className="filter-actions">
                    <button type="submit" className="btn btn-primary" disabled={isSearchingEquipment}>
                      <Search size={16} />
                      <span>{isSearchingEquipment ? 'Searching...' : 'Search'}</span>
                    </button>
                    <button type="button" className="btn btn-outline" onClick={handleClearFilters}>
                      Clear
                    </button>
                  </div>
                </form>
              </div>

              {/* Equipment Grid */}
              <div className="equipment-section-title">
                <h3>Available Equipment ({farmerEquipment.length})</h3>
                <button className="btn btn-outline" onClick={() => loadFarmerEquipment()} title="Refresh listings">
                  <RefreshCw size={15} className={isSearchingEquipment ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {isSearchingEquipment ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading real equipment from MySQL...
                </div>
              ) : farmerEquipment.length === 0 ? (
                <div className="empty-state">
                  <Tractor size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h4>No machinery found</h4>
                  <p>Try adjusting your search criteria or clearing filters to view all equipment.</p>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={handleClearFilters}>
                    View All Available Equipment
                  </button>
                </div>
              ) : (
                <div className="equipment-grid">
                  {farmerEquipment.map((item) => (
                    <div key={item.id} className="equipment-card">
                      <div className="card-img-wrapper">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl.startsWith('http') ? item.imageUrl : BACKEND_BASE + item.imageUrl}
                            alt={item.name}
                            className="card-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div
                          className="card-img-placeholder"
                          style={{ display: item.imageUrl ? 'none' : 'flex' }}
                        >
                          <Tractor size={40} />
                          <span>No Image Available</span>
                        </div>
                        <span className="card-badge-category">{item.category}</span>
                        <span className={`card-badge-status ${item.availability === 'AVAILABLE' ? 'status-available' : 'status-unavailable'}`}>
                          {item.availability}
                        </span>
                      </div>

                      <div className="card-body">
                        <h4 className="card-title">{item.name}</h4>
                        <div className="card-meta">
                          <div className="card-meta-item">
                            <MapPin size={14} />
                            <span>{item.city ? `${item.city}, ${item.state}` : item.location}</span>
                          </div>
                          <div className="card-meta-item">
                            <User size={14} />
                            <span>Owner: {item.ownerName || 'Verified Owner'}</span>
                          </div>
                        </div>

                        <div className="card-pricing">
                          <div className="price-day">
                            ₹{item.pricePerDay} <span>/ day</span>
                          </div>
                          {item.pricePerHour && (
                            <div className="price-hour">₹{item.pricePerHour} / hr</div>
                          )}
                        </div>

                        <div className="card-actions">
                          <button className="btn btn-outline" onClick={() => openDetailsModal(item.id)}>
                            <Eye size={16} />
                            <span>Details</span>
                          </button>
                          <button
                            className="btn btn-primary"
                            disabled={item.availability !== 'AVAILABLE'}
                            onClick={() => openBookingModal(item)}
                          >
                            <Calendar size={16} />
                            <span>Book Now</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeFarmerTab === 'bookings' && (
            <div>
              <div className="equipment-section-title">
                <h3>My Rental Booking Requests</h3>
                <button className="btn btn-outline" onClick={loadFarmerBookings} disabled={isLoadingBookings}>
                  <RefreshCw size={15} className={isLoadingBookings ? 'spin' : ''} />
                  <span>Refresh Status</span>
                </button>
              </div>

              {isLoadingBookings ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  Loading your booking records...
                </div>
              ) : farmerBookings.length === 0 ? (
                <div className="empty-state">
                  <ShoppingBag size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
                  <h4>No Bookings Placed Yet</h4>
                  <p>Browse available tractors and farm equipment to place your first rental request!</p>
                  <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setActiveFarmerTab('browse')}>
                    Browse Equipment Now
                  </button>
                </div>
              ) : (
                <div className="bookings-list">
                  {farmerBookings.map((b) => (
                    <div key={b.id} className="booking-card">
                      <div className="booking-info">
                        <h4>{b.equipmentName || 'Agricultural Machinery'}</h4>
                        <div className="booking-details-sub">
                          <div>
                            <strong>Category:</strong> {b.equipmentCategory || 'N/A'}
                          </div>
                          <div>
                            <strong>Duration:</strong> {b.startDate} to {b.endDate}
                          </div>
                          <div>
                            <strong>Total Cost:</strong> ₹{b.totalPrice ? Number(b.totalPrice).toFixed(2) : '0.00'}
                          </div>
                          {b.ownerName && (
                            <div>
                              <strong>Owner:</strong> {b.ownerName} ({b.ownerPhone || 'No Phone'})
                            </div>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className={`booking-status-pill status-${b.status}`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Equipment Details Modal */}
        {isDetailsModalOpen && (
          <div className="modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Equipment Specification Details</h3>
                <button className="modal-close" onClick={() => setIsDetailsModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              {isLoadingDetails ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>Loading details from database...</div>
              ) : detailsData ? (
                <div className="modal-body">
                  {detailsData.imageUrl && (
                    <img
                      src={detailsData.imageUrl.startsWith('http') ? detailsData.imageUrl : BACKEND_BASE + detailsData.imageUrl}
                      alt={detailsData.name}
                      className="details-header-img"
                    />
                  )}

                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    {detailsData.name}
                  </h2>

                  <div className="details-grid">
                    <div className="details-item">
                      <label>Category</label>
                      <span>{detailsData.category}</span>
                    </div>
                    <div className="details-item">
                      <label>Availability</label>
                      <span style={{ color: detailsData.availability === 'AVAILABLE' ? '#15803d' : '#b91c1c' }}>
                        {detailsData.availability}
                      </span>
                    </div>
                    <div className="details-item">
                      <label>Price Per Day</label>
                      <span>₹{detailsData.pricePerDay}</span>
                    </div>
                    <div className="details-item">
                      <label>Price Per Hour</label>
                      <span>{detailsData.pricePerHour ? `₹${detailsData.pricePerHour}` : 'N/A'}</span>
                    </div>
                    <div className="details-item">
                      <label>Location</label>
                      <span>{detailsData.location}</span>
                    </div>
                    <div className="details-item">
                      <label>City & State</label>
                      <span>{detailsData.city}, {detailsData.state} ({detailsData.pincode})</span>
                    </div>
                    <div className="details-item">
                      <label>Owner Name</label>
                      <span>{detailsData.ownerName}</span>
                    </div>
                    <div className="details-item">
                      <label>Owner Contact</label>
                      <span>{detailsData.ownerPhone || 'Available upon booking'}</span>
                    </div>
                  </div>

                  {detailsData.description && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Description</label>
                      <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.25rem' }}>{detailsData.description}</p>
                    </div>
                  )}

                  {detailsData.specifications && (
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Specifications</label>
                      <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.25rem' }}>{detailsData.specifications}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={detailsData.availability !== 'AVAILABLE'}
                      onClick={() => {
                        setIsDetailsModalOpen(false);
                        openBookingModal(detailsData);
                      }}
                    >
                      <Calendar size={18} />
                      <span>Book Equipment Now</span>
                    </button>
                    <button className="btn btn-outline" onClick={() => setIsDetailsModalOpen(false)}>
                      Close
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Book Now Modal */}
        {isBookingModalOpen && bookingEquipment && (
          <div className="modal-overlay" onClick={() => setIsBookingModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Book Equipment — {bookingEquipment.name}</h3>
                <button className="modal-close" onClick={() => setIsBookingModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateBookingSubmit} className="modal-body">
                {bookingError && <div className="alert alert-danger">{bookingError}</div>}

                <div className="form-group">
                  <label>Selected Machine</label>
                  <input type="text" className="form-control" value={bookingEquipment.name} disabled />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      min={getTodayDate()}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      min={startDate || getTodayDate()}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="booking-summary-card">
                  <div className="summary-row">
                    <span>Daily Rental Rate:</span>
                    <span>₹{bookingEquipment.pricePerDay} / day</span>
                  </div>
                  <div className="summary-row">
                    <span>Duration:</span>
                    <span>{calculateBookingDays()} Day(s)</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Estimated Price:</span>
                    <span>₹{(bookingEquipment.pricePerDay * calculateBookingDays()).toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isSubmittingBooking}>
                    {isSubmittingBooking ? 'Submitting Request...' : 'Confirm & Submit Booking'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setIsBookingModalOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── AUTHENTICATED: OWNER SIDE ───────────────────────────────────────────
  return (
    <div>
      {/* App Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand">
            <div className="brand-icon">
              <Tractor size={22} />
            </div>
            <div className="brand-text">
              <h1>KhetRent</h1>
              <span>Owner Management Portal</span>
            </div>
          </div>

          <div className="header-actions">
            <div className="user-badge">
              <span>{userName || 'Owner'}</span>
              <span className="role-pill">OWNER</span>
            </div>
            <button className="btn btn-outline" onClick={handleLogout} title="Log Out">
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container">
        {/* Messages */}
        {errorMsg && (
          <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div className="banner-content">
            <h2>Welcome back, {userName || 'Equipment Owner'}!</h2>
            <p>Live aggregates synchronized with the real MySQL database.</p>
          </div>
          <div className="banner-actions">
            <button
              className="btn btn-outline-white"
              onClick={() => { loadDashboard(); loadOwnerBookings(); }}
              disabled={loading}
              title="Refresh from MySQL"
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              id="add-equipment-btn"
              className="btn btn-primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={18} />
              <span>Add Equipment</span>
            </button>
          </div>
        </div>

        {/* 4 Key Aggregates Cards */}
        <section className="stats-grid">
          {/* Card 1: Total Earnings */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Total Earnings</div>
              <div className="stat-value">
                ₹{dashboard?.totalEarnings ? Number(dashboard.totalEarnings).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <div className="stat-sub">From COMPLETED rentals only</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-green">
              <IndianRupee size={26} />
            </div>
          </div>

          {/* Card 2: Active Equipment */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Active Equipment</div>
              <div className="stat-value">{dashboard?.activeEquipmentCount ?? 0}</div>
              <div className="stat-sub">
                {dashboard?.totalEquipmentCount ?? 0} total machines listed
              </div>
            </div>
            <div className="stat-icon-wrapper stat-icon-blue">
              <Tractor size={26} />
            </div>
          </div>

          {/* Card 3: Pending Requests */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Pending Requests</div>
              <div className="stat-value">{dashboard?.pendingBookingsCount ?? 0}</div>
              <div className="stat-sub">Bookings requiring action</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-amber">
              <Clock size={26} />
            </div>
          </div>

          {/* Card 4: Completed Rentals */}
          <div className="stat-card">
            <div className="stat-info">
              <div className="stat-label">Completed Rentals</div>
              <div className="stat-value">{dashboard?.completedRentalsCount ?? 0}</div>
              <div className="stat-sub">Fulfilled rental contracts</div>
            </div>
            <div className="stat-icon-wrapper stat-icon-green">
              <CheckCircle2 size={26} />
            </div>
          </div>
        </section>

        {/* Booking Requests Section */}
        <section className="equipment-card-section" style={{ marginBottom: '2rem' }}>
          <div className="section-header">
            <h3>Incoming Booking Requests</h3>
            <button className="btn btn-outline btn-sm" onClick={loadOwnerBookings} disabled={isLoadingOwnerBookings}>
              <RefreshCw size={14} className={isLoadingOwnerBookings ? 'spin' : ''} />
              <span>Refresh Requests</span>
            </button>
          </div>

          {isLoadingOwnerBookings ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              Loading booking requests...
            </div>
          ) : ownerBookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Clock size={36} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--text-muted)' }}>No booking requests received yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="equipment-table">
                <thead>
                  <tr>
                    <th>Farmer Details</th>
                    <th>Equipment Name</th>
                    <th>Rental Dates</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ownerBookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.farmerName || 'Farmer'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {b.farmerPhone ? `📞 ${b.farmerPhone}` : 'No phone provided'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{b.equipmentName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.equipmentCategory}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>
                        {b.startDate} → {b.endDate}
                      </td>
                      <td className="price-text">
                        ₹{b.totalPrice ? Number(b.totalPrice).toFixed(2) : '0.00'}
                      </td>
                      <td>
                        <span className={`booking-status-pill status-${b.status}`}>
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === 'PENDING' ? (
                          <div className="action-buttons">
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: '#15803d', borderColor: '#15803d', padding: '0.35rem 0.65rem' }}
                              onClick={() => handleOwnerBookingStatusUpdate(b.id, 'ACCEPTED')}
                            >
                              <Check size={14} /> Accept
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: '#b91c1c', borderColor: '#fca5a5', padding: '0.35rem 0.65rem' }}
                              onClick={() => handleOwnerBookingStatusUpdate(b.id, 'REJECTED')}
                            >
                              <X size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Decision saved ({b.status})
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* My Equipment Table */}
        <section className="equipment-card-section">
          <div className="section-header">
            <h3>My Listed Equipment</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} />
              <span>Add Machine</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Loading equipment data from MySQL...
            </div>
          ) : !dashboard?.equipmentList || dashboard.equipmentList.length === 0 ? (
            <div className="empty-state">
              <Tractor size={48} style={{ color: '#cbd5e1', marginBottom: '1rem' }} />
              <h4>No equipment listed yet</h4>
              <p>Click "Add Machine" to list your first tractor or harvester for rental.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="equipment-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Category</th>
                    <th>Rate (Day)</th>
                    <th>Rate (Hour)</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.equipmentList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="equipment-cell">
                          <div className="equipment-thumb">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl.startsWith('http') ? item.imageUrl : BACKEND_BASE + item.imageUrl}
                                alt={item.name}
                                className="equipment-thumb-img"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div
                              className="equipment-thumb-fallback"
                              style={{ display: item.imageUrl ? 'none' : 'flex' }}
                            >
                              <Tractor size={20} />
                            </div>
                          </div>
                          <div>
                            <div className="equipment-title">{item.name}</div>
                            <div className="equipment-sub">ID: #{item.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-category">{item.category}</span>
                      </td>
                      <td className="price-text">₹{item.pricePerDay}</td>
                      <td>{item.pricePerHour ? `₹${item.pricePerHour}` : '—'}</td>
                      <td>
                        <div className="location-cell">
                          <MapPin size={14} />
                          <span>{item.city ? `${item.city}, ${item.state}` : item.location}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${item.availability === 'AVAILABLE' ? 'badge-available' : 'badge-unavailable'}`}>
                          {item.availability}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-view"
                            title="View Details"
                            onClick={() => openDetailsModal(item.id)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon btn-icon-edit"
                            title="Edit Equipment"
                            onClick={() => openEditModal(item)}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="btn-icon btn-icon-delete"
                            title="Delete Equipment"
                            onClick={() => handleDeleteEquipment(item.id, item.name)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Owner Add Equipment Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Equipment</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddEquipment} className="modal-body">
              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. John Deere 5050D Tractor"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    className="form-control"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Availability *</label>
                  <select
                    name="availability"
                    className="form-control"
                    value={formData.availability}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Day (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerDay"
                    className="form-control"
                    placeholder="2500.00"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price Per Hour (₹) (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerHour"
                    className="form-control"
                    placeholder="350.00"
                    value={formData.pricePerHour}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location / Village *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  placeholder="e.g. Village Khed, Taluka Haveli"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="Pune"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="Maharashtra"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-control"
                    placeholder="411001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  placeholder="Describe the machinery condition, HP, fuel type..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Specifications</label>
                <input
                  type="text"
                  name="specifications"
                  className="form-control"
                  placeholder="e.g. 50 HP, 4WD, Power Steering"
                  value={formData.specifications}
                  onChange={handleInputChange}
                />
              </div>

              {/* Photo Upload Section */}
              <div className="form-group">
                <label>Equipment Photo</label>
                <div className="photo-upload-section">
                  {photoPreview ? (
                    <div className="photo-preview-wrapper">
                      <img src={photoPreview} alt="Preview" className="photo-preview-img" />
                      <div className="photo-preview-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ background: 'white', color: '#b91c1c', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={handleRemovePhoto}
                        >
                          <Trash2 size={14} /> Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <PhotoDropzone onFileSelect={handlePhotoSelect} inputRef={photoInputRef} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isSubmitting || isUploadingPhoto}>
                  {isUploadingPhoto ? 'Uploading Photo...' : isSubmitting ? 'Saving Machinery...' : 'Save Equipment'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner Edit Equipment Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Equipment Details</h3>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditEquipment} className="modal-body">
              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    className="form-control"
                    value={editFormData.category}
                    onChange={handleEditInputChange}
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Availability *</label>
                  <select
                    name="availability"
                    className="form-control"
                    value={editFormData.availability}
                    onChange={handleEditInputChange}
                    required
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="UNAVAILABLE">UNAVAILABLE</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price Per Day (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerDay"
                    className="form-control"
                    value={editFormData.pricePerDay}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price Per Hour (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerHour"
                    className="form-control"
                    value={editFormData.pricePerHour}
                    onChange={handleEditInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location / Village *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    value={editFormData.city}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    value={editFormData.state}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    className="form-control"
                    value={editFormData.pincode}
                    onChange={handleEditInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="form-group">
                <label>Specifications</label>
                <input
                  type="text"
                  name="specifications"
                  className="form-control"
                  value={editFormData.specifications}
                  onChange={handleEditInputChange}
                />
              </div>

              {/* Edit Photo Section */}
              <div className="form-group">
                <label>Equipment Photo</label>
                <div className="photo-upload-section">
                  {editPhotoPreview ? (
                    <div className="photo-preview-wrapper">
                      <img src={editPhotoPreview} alt="Preview" className="photo-preview-img" />
                      <div className="photo-preview-actions">
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ background: 'white', color: '#b91c1c', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                          onClick={handleRemoveEditPhoto}
                        >
                          <Trash2 size={14} /> Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <PhotoDropzone onFileSelect={handleEditPhotoSelect} inputRef={editPhotoInputRef} />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={isEditSubmitting || isEditUploadingPhoto}>
                  {isEditUploadingPhoto ? 'Uploading Photo...' : isEditSubmitting ? 'Updating...' : 'Update Equipment'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Owner View Details Modal */}
      {isDetailsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Equipment Details</h3>
              <button className="modal-close" onClick={() => setIsDetailsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {isLoadingDetails ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading details...</div>
            ) : detailsData ? (
              <div className="modal-body">
                {detailsData.imageUrl && (
                  <img
                    src={detailsData.imageUrl.startsWith('http') ? detailsData.imageUrl : BACKEND_BASE + detailsData.imageUrl}
                    alt={detailsData.name}
                    className="details-header-img"
                  />
                )}

                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                  {detailsData.name}
                </h2>

                <div className="details-grid">
                  <div className="details-item">
                    <label>Category</label>
                    <span>{detailsData.category}</span>
                  </div>
                  <div className="details-item">
                    <label>Availability</label>
                    <span style={{ color: detailsData.availability === 'AVAILABLE' ? '#15803d' : '#b91c1c' }}>
                      {detailsData.availability}
                    </span>
                  </div>
                  <div className="details-item">
                    <label>Price Per Day</label>
                    <span>₹{detailsData.pricePerDay}</span>
                  </div>
                  <div className="details-item">
                    <label>Price Per Hour</label>
                    <span>{detailsData.pricePerHour ? `₹${detailsData.pricePerHour}` : 'N/A'}</span>
                  </div>
                  <div className="details-item">
                    <label>Location</label>
                    <span>{detailsData.location}</span>
                  </div>
                  <div className="details-item">
                    <label>City & State</label>
                    <span>{detailsData.city}, {detailsData.state} ({detailsData.pincode})</span>
                  </div>
                </div>

                {detailsData.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Description</label>
                    <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.25rem' }}>{detailsData.description}</p>
                  </div>
                )}

                {detailsData.specifications && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Specifications</label>
                    <p style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.25rem' }}>{detailsData.specifications}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-primary" onClick={() => { setIsDetailsModalOpen(false); openEditModal(detailsData); }}>
                    <Pencil size={16} /> Edit Machine
                  </button>
                  <button className="btn btn-outline" onClick={() => setIsDetailsModalOpen(false)}>
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
