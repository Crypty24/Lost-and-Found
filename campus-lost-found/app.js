// Campus Lost & Found Application JavaScript

// Application State Management
class CampusLostFoundApp {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'home';
        this.currentItem = null;
        this.currentPhotoIndex = 0;
        this.currentStep = 1;
        this.currentView = 'grid';
        this.itemsPerPage = 9;
        this.currentItemsShown = this.itemsPerPage;
        this.users = [];
        this.items = [];
        // Hold File objects selected in the add-item form for upload to storage
        this.pendingPhotoFiles = [];
        this.theme = localStorage.getItem('theme') || 'light';
        this.init();
    }

    init() {
        // Load items from Supabase if configured, fallback to sample data
        this.loadInitialData().then(() => {
            this.updateStats();
            this.renderRecentItems();
        });
        this.setupEventListeners();
        this.updateAuthState();
        this.applyTheme();
        this.animateStatsOnLoad();
    }

    // Prefer Supabase data, fallback to local sample
    async loadInitialData() {
        try {
            if (!window.sb) {
                this.loadSampleData();
                return;
            }
            const { data, error } = await window.sb
                .from('items')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            this.items = (data || []).map(row => ({
                id: row.id,
                title: row.title,
                description: row.description,
                category: row.category,
                status: row.status,
                location: row.location,
                contactEmail: row.contact_email,
                contactPhone: row.contact_phone,
                userId: row.user_id,
                userName: row.user_name || '',
                datePosted: row.date_posted || (row.created_at ? row.created_at.slice(0, 10) : null),
                photos: row.photos || []
            }));
        } catch (e) {
            console.warn('Falling back to sample data:', e.message);
            this.loadSampleData();
        }
    }

    // Data Loading
    loadSampleData() {
        // Sample users data
        this.users = [
            {
                id: 1,
                firstName: "John",
                lastName: "Smith",
                email: "john.smith@campus.edu",
                password: "password123"
            },
            {
                id: 2,
                firstName: "Sarah",
                lastName: "Johnson",
                email: "sarah.johnson@campus.edu",
                password: "password123"
            },
            {
                id: 3,
                firstName: "Mike",
                lastName: "Davis",
                email: "mike.davis@campus.edu",
                password: "password123"
            }
        ];

        // Sample items data
        this.items = [
            {
                id: 1,
                title: "iPhone 13 Pro - Blue",
                description: "Lost my blue iPhone 13 Pro near the library. Has a clear case with stickers on it. Very important as it contains all my study materials and photos.",
                category: "Electronics",
                status: "Lost",
                location: "Main Library",
                contactEmail: "john.smith@campus.edu",
                contactPhone: "+1-555-0123",
                userId: 1,
                userName: "John Smith",
                datePosted: "2025-09-28",
                photos: [
                    "https://images.unsplash.com/photo-1592286904093-3b5c4b1e7d50?w=600&h=400&fit=crop&auto=format",
                    "https://images.unsplash.com/photo-1580522154071-c6ca47a859ad?w=600&h=400&fit=crop&auto=format"
                ]
            },
            {
                id: 2,
                title: "Red Leather Wallet",
                description: "Found a red leather wallet in the cafeteria. Contains student ID and some cash. Looking to return it to the rightful owner.",
                category: "Other",
                status: "Found",
                location: "Student Cafeteria",
                contactEmail: "sarah.johnson@campus.edu",
                contactPhone: "+1-555-0456",
                userId: 2,
                userName: "Sarah Johnson",
                datePosted: "2025-09-29",
                photos: [
                    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=400&fit=crop&auto=format",
                    "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=400&fit=crop&auto=format"
                ]
            },
            {
                id: 3,
                title: "Calculus Textbook",
                description: "Lost my calculus textbook in Room 204, Mathematics Building. Has my name written inside the front cover. Really need it for upcoming exams.",
                category: "Books",
                status: "Lost",
                location: "Mathematics Building",
                contactEmail: "mike.davis@campus.edu",
                contactPhone: "+1-555-0789",
                userId: 3,
                userName: "Mike Davis",
                datePosted: "2025-09-27",
                photos: [
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=400&fit=crop&auto=format",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop&auto=format"
                ]
            },
            {
                id: 4,
                title: "AirPods Pro",
                description: "Found AirPods Pro in the gym locker room. Still in charging case. Please contact me if these are yours.",
                category: "Electronics",
                status: "Found",
                location: "Campus Gym",
                contactEmail: "john.smith@campus.edu",
                contactPhone: "+1-555-0123",
                userId: 1,
                userName: "John Smith",
                datePosted: "2025-09-30",
                photos: [
                    "https://images.unsplash.com/photo-1606220838315-056192d5e927?w=600&h=400&fit=crop&auto=format",
                    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&h=400&fit=crop&auto=format"
                ]
            },
            {
                id: 5,
                title: "Blue Denim Jacket",
                description: "Lost my favorite blue denim jacket at the student union. Size M, has patches on it. Sentimental value.",
                category: "Clothing",
                status: "Lost",
                location: "Student Union Building",
                contactEmail: "sarah.johnson@campus.edu",
                contactPhone: "+1-555-0456",
                userId: 2,
                userName: "Sarah Johnson",
                datePosted: "2025-09-26",
                photos: [
                    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?w=600&h=400&fit=crop&auto=format",
                    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=400&fit=crop&auto=format"
                ]
            },
            {
                id: 6,
                title: "Student ID Card",
                description: "Found a student ID card near the parking lot. Name shows Emily Chen. Please contact me to retrieve it.",
                category: "IDs",
                status: "Found",
                location: "Main Parking Lot",
                contactEmail: "mike.davis@campus.edu",
                contactPhone: "+1-555-0789",
                userId: 3,
                userName: "Mike Davis",
                datePosted: "2025-09-29",
                photos: [
                    "https://images.unsplash.com/photo-1586281380614-7c4def8c1b6b?w=600&h=400&fit=crop&auto=format"
                ]
            }
        ];
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.dataset.page) {
                e.preventDefault();
                this.navigateTo(e.target.dataset.page);
            }
        });

        // Mobile menu toggle
        document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
            document.getElementById('navbar-menu').classList.toggle('active');
        });

        // Quick actions
        this.setupQuickActions();

        // Theme toggle
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Auth forms
        this.setupAuthForms();

        // Profile form
        this.setupProfileForm();

        // Add item form
        this.setupAddItemForm();

        // Search and filters
        this.setupSearchAndFilters();

        // View toggle
        this.setupViewToggle();

        // Photo slideshow
        this.setupPhotoSlideshow();

        // Dashboard tabs  
        this.setupDashboardTabs();

        // Modals
        this.setupModals();

        // Toast
        this.setupToast();

        // Navbar hide/show on scroll
        this.setupScrollHideNavbar();
    }

    // Quick Actions Setup
    setupQuickActions() {
        const quickActionsToggle = document.getElementById('quick-actions-toggle');
        const quickActionsMenu = document.getElementById('quick-actions-menu');

        if (quickActionsToggle && quickActionsMenu) {
            quickActionsToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                quickActionsMenu.classList.toggle('hidden');
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.quick-actions')) {
                    quickActionsMenu.classList.add('hidden');
                }
            });
        }
    }

    // Hide navbar on scroll down, show on scroll up
    setupScrollHideNavbar() {
        const navbar = document.getElementById('navbar');
        if (!navbar) return;

        let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const minDelta = 5; // ignore tiny scrolls

        const onScroll = () => {
            const currentY = window.pageYOffset || document.documentElement.scrollTop || 0;
            const delta = currentY - lastScrollY;

            // Do not hide when at top of page
            if (currentY <= 0) {
                navbar.classList.remove('navbar--hidden');
                navbar.classList.remove('navbar--scrolled');
                lastScrollY = currentY;
                return;
            }

            // Ignore small deltas
            if (Math.abs(delta) < minDelta) {
                // Still toggle scrolled if past top
                navbar.classList.toggle('navbar--scrolled', currentY > 0);
                return;
            }

            // Keep navbar visible if mobile menu is open
            const mobileMenuOpen = document.getElementById('navbar-menu')?.classList.contains('active');
            if (mobileMenuOpen) {
                navbar.classList.remove('navbar--hidden');
                navbar.classList.toggle('navbar--scrolled', currentY > 0);
                lastScrollY = currentY;
                return;
            }

            if (delta > 0) {
                // Scrolling down
                navbar.classList.add('navbar--hidden');
            } else {
                // Scrolling up
                navbar.classList.remove('navbar--hidden');
            }

            // Add scrolled shadow when past top
            navbar.classList.toggle('navbar--scrolled', currentY > 0);

            lastScrollY = currentY;
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Auth Forms Setup
    setupAuthForms() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchAuthTab(tabName);
            });
        });

        // Login form
        document.getElementById('login-form-element')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Signup form
        document.getElementById('signup-form-element')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            this.handleLogout();
        });

        // Change password forms (support both index and dashboard)
        document.getElementById('change-password-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChangePassword();
        });
        document.getElementById('password-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChangePassword();
        });

        // Password visibility toggles
        document.querySelectorAll('.password-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (!input) return;
                const showing = input.type === 'text';
                input.type = showing ? 'password' : 'text';
                btn.textContent = showing ? 'Show' : 'Hide';
                btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
            });
        });
    }

    // Profile Form Setup
    setupProfileForm() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        const firstInput = document.getElementById('profile-firstname');
        const lastInput = document.getElementById('profile-lastname');
        const editBtn = document.getElementById('edit-profile-btn');
        const saveBtn = document.getElementById('save-profile-btn');
        const cancelBtn = document.getElementById('cancel-profile-btn');

        const toggleEditing = (enable) => {
            if (firstInput) firstInput.readOnly = !enable;
            if (lastInput) lastInput.readOnly = !enable;
            if (enable) {
                firstInput?.focus();
            }
            if (editBtn) editBtn.style.display = enable ? 'none' : 'inline-block';
            if (saveBtn) saveBtn.style.display = enable ? 'inline-block' : 'none';
            if (cancelBtn) cancelBtn.style.display = enable ? 'inline-block' : 'none';
        };

        editBtn?.addEventListener('click', () => {
            toggleEditing(true);
        });

        cancelBtn?.addEventListener('click', () => {
            // Reset values to current user
            if (this.currentUser) {
                if (firstInput) firstInput.value = this.currentUser.firstName || '';
                if (lastInput) lastInput.value = this.currentUser.lastName || '';
            }
            toggleEditing(false);
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleProfileUpdate().then(() => {
                toggleEditing(false);
            });
        });
    }

    // Add Item Form Setup
    setupAddItemForm() {
        const form = document.getElementById('add-item-form');
        if (!form) return;

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddItem();
        });

        // Step navigation
        document.getElementById('next-step')?.addEventListener('click', () => {
            this.nextStep();
        });

        document.getElementById('prev-step')?.addEventListener('click', () => {
            this.previousStep();
        });

        // Photo upload
        document.getElementById('upload-btn')?.addEventListener('click', () => {
            document.getElementById('photo-input').click();
        });

        document.getElementById('photo-input')?.addEventListener('change', (e) => {
            this.handlePhotoUpload(e.target.files);
        });

        // Location dropdown change
        document.getElementById('item-location')?.addEventListener('change', (e) => {
            this.handleLocationChange(e.target.value);
        });
    }

    // Search and Filters Setup
    setupSearchAndFilters() {
        const searchInput = document.getElementById('search-input');
        const statusFilter = document.getElementById('status-filter');
        const categoryFilter = document.getElementById('category-filter');
        const dateFromFilter = document.getElementById('date-from');
        const dateToFilter = document.getElementById('date-to');
        const sortSelect = document.getElementById('sort-select');
        const clearFilters = document.getElementById('clear-filters');
        const loadMoreBtn = document.getElementById('load-more-btn');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterAndRenderItems());
        }
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterAndRenderItems());
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterAndRenderItems());
        }
        if (dateFromFilter) {
            dateFromFilter.addEventListener('change', () => this.filterAndRenderItems());
        }
        if (dateToFilter) {
            dateToFilter.addEventListener('change', () => this.filterAndRenderItems());
        }
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.filterAndRenderItems());
        }
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearAllFilters());
        }
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreItems());
        }
    }

    // View Toggle Setup
    setupViewToggle() {
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
            });
        });
    }

    // Photo Slideshow Setup
    setupPhotoSlideshow() {
        document.getElementById('prev-photo')?.addEventListener('click', () => this.previousPhoto());
        document.getElementById('next-photo')?.addEventListener('click', () => this.nextPhoto());
    }

    // Dashboard Tabs Setup
    setupDashboardTabs() {
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchDashboardTab(tabName);
            });
        });
    }

    // Modals Setup
    setupModals() {
        // Success modal
        document.getElementById('success-ok')?.addEventListener('click', () => {
            this.hideModal('success-modal');
        });

        // Edit modal
        document.getElementById('edit-modal-close')?.addEventListener('click', () => {
            this.hideModal('edit-modal');
        });

        document.getElementById('edit-cancel')?.addEventListener('click', () => {
            this.hideModal('edit-modal');
        });

        document.getElementById('edit-item-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditItem();
        });

        // Confirmation modal
        document.getElementById('modal-cancel')?.addEventListener('click', () => {
            this.hideModal('confirmation-modal');
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }

    // Toast Setup
    setupToast() {
        document.getElementById('toast-close')?.addEventListener('click', () => {
            document.getElementById('toast').classList.add('hidden');
        });
    }

    // Navigation Methods
    navigateTo(page) {
        // Check authentication for protected pages
        if (['add-item', 'dashboard'].includes(page) && !this.currentUser) {
            this.showToast('Please login to access this page', 'error');
            this.navigateTo('login');
            return;
        }

        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const navLink = document.querySelector(`[data-page="${page}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }

        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        this.currentPage = page;

        // Handle page-specific logic
        this.handlePageLoad(page);

        // Close mobile menu and quick actions
        document.getElementById('navbar-menu')?.classList.remove('active');
        document.getElementById('quick-actions-menu')?.classList.add('hidden');
    }

    handlePageLoad(page) {
        switch (page) {
            case 'home':
                this.updateStats();
                this.renderRecentItems();
                this.animateStatsOnLoad();
                break;
            case 'browse':
                this.currentItemsShown = this.itemsPerPage;
                this.filterAndRenderItems();
                break;
            case 'add-item':
                this.resetAddItemForm();
                break;
            case 'dashboard':
                this.renderDashboard();
                break;
        }
    }

    // Authentication Methods
    switchAuthTab(tabName) {
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(`${tabName}-form`)?.classList.add('active');
    }

    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (window.sb) {
            const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
            if (error) {
                this.showToast(error.message || 'Invalid email or password', 'error');
                return;
            }
            await this.updateAuthState();
            if (this.currentUser) {
                this.showToast(`Welcome back, ${this.currentUser.firstName}!`, 'success');
                this.navigateTo('dashboard');
            }
        } else {
            const user = this.users.find(u => u.email === email && u.password === password);
            if (user) {
                this.currentUser = user;
                this.updateAuthState();
                this.showToast(`Welcome back, ${user.firstName}!`, 'success');
                this.navigateTo('dashboard');
            } else {
                this.showToast('Invalid email or password', 'error');
            }
        }
    }

    async handleSignup() {
        const firstName = document.getElementById('signup-firstname').value;
        const lastName = document.getElementById('signup-lastname').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }
        if (window.sb) {
            const { data, error } = await window.sb.auth.signUp({
                email,
                password,
                options: {
                    data: { first_name: firstName, last_name: lastName }
                }
            });
            if (error) {
                this.showToast(error.message || 'Sign up failed', 'error');
                return;
            }
            const userId = data?.user?.id;
            if (userId) {
                const { error: profileError } = await window.sb
                    .from('profiles')
                    .upsert({ user_id: userId, first_name: firstName, last_name: lastName });
                if (profileError) {
                    console.warn('Profile upsert failed:', profileError.message);
                }
            }
            await this.updateAuthState();
            this.showToast(`Welcome to Campus Lost & Found, ${firstName}!`, 'success');
            this.navigateTo('dashboard');
        } else {
            if (this.users.find(u => u.email === email)) {
                this.showToast('Email already registered', 'error');
                return;
            }
            const newUser = { id: Date.now(), firstName, lastName, email, password };
            this.users.push(newUser);
            this.currentUser = newUser;
            this.updateAuthState();
            this.showToast(`Welcome to Campus Lost & Found, ${firstName}!`, 'success');
            this.navigateTo('dashboard');
        }
    }

    async handleLogout() {
        if (window.sb) {
            await window.sb.auth.signOut();
        }
        this.currentUser = null;
        await this.updateAuthState();
        this.showToast('Logged out successfully', 'success');
        this.navigateTo('home');
    }

    async handleChangePassword() {
        const currentPassword = document.getElementById('current-password')?.value || '';
        const newPassword = document.getElementById('new-password')?.value || '';
        const confirmNewPassword = (document.getElementById('confirm-new-password')?.value || document.getElementById('confirm-password')?.value || '');

        const form = document.getElementById('change-password-form') || document.getElementById('password-form');

        if (!newPassword || newPassword.length < 6) {
            this.showToast('Password must be at least 6 characters', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.showToast('New passwords do not match', 'error');
            return;
        }

        try {
            if (window.sb && this.currentUser?.email) {
                // Optional verification of current password when provided
                if (currentPassword) {
                    const { error: signInError } = await window.sb.auth.signInWithPassword({
                        email: this.currentUser.email,
                        password: currentPassword
                    });
                    if (signInError) {
                        this.showToast('Current password is incorrect', 'error');
                        return;
                    }
                }

                const { error } = await window.sb.auth.updateUser({ password: newPassword });
                if (error) {
                    this.showToast(error.message || 'Failed to update password', 'error');
                    return;
                }
                this.showToast('Password updated successfully', 'success');
                form?.reset();
            } else {
                // Fallback local mode for sample users
                if (!this.currentUser) {
                    this.showToast('Please login first', 'error');
                    return;
                }
                const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
                if (userIndex !== -1) {
                    if (currentPassword && this.users[userIndex].password && this.users[userIndex].password !== currentPassword) {
                        this.showToast('Current password is incorrect', 'error');
                        return;
                    }
                    this.users[userIndex].password = newPassword;
                }
                this.currentUser.password = newPassword;
                this.showToast('Password updated successfully', 'success');
                form?.reset();
            }
        } catch (e) {
            this.showToast('Failed to update password', 'error');
        }
    }

    async handleProfileUpdate() {
        const firstName = (document.getElementById('profile-firstname')?.value || '').trim();
        const lastName = (document.getElementById('profile-lastname')?.value || '').trim();

        if (!this.currentUser) {
            this.showToast('Please login to update profile', 'error');
            return;
        }
        if (!firstName) {
            this.showToast('First name is required', 'error');
            return;
        }

        try {
            if (window.sb) {
                const { error } = await window.sb
                    .from('profiles')
                    .upsert({ user_id: this.currentUser.id, first_name: firstName, last_name: lastName });
                if (error) throw error;
            } else {
                const user = this.users.find(u => u.id === this.currentUser.id);
                if (user) {
                    user.firstName = firstName;
                    user.lastName = lastName;
                }
            }

            // Update local state and UI
            this.currentUser.firstName = firstName;
            this.currentUser.lastName = lastName;
            const userNameEl = document.getElementById('user-name');
            if (userNameEl) userNameEl.textContent = firstName;
            this.renderDashboard();
            this.showToast('Profile updated successfully', 'success');
        } catch (e) {
            this.showToast(e.message || 'Failed to update profile', 'error');
        }
    }

    async updateAuthState() {
        const userInfo = document.getElementById('user-info');
        const loginNav = document.getElementById('login-nav');
        const userName = document.getElementById('user-name');
        
        if (window.sb) {
            try {
                const { data: { user } } = await window.sb.auth.getUser();
                if (user) {
                    let firstName = '';
                    let lastName = '';
                    const { data: profile } = await window.sb
                        .from('profiles')
                        .select('first_name,last_name')
                        .eq('user_id', user.id)
                        .single();
                    if (profile) {
                        firstName = profile.first_name;
                        lastName = profile.last_name;
                    } else {
                        const meta = user.user_metadata || {};
                        firstName = meta.first_name || meta.firstName || '';
                        lastName = meta.last_name || meta.lastName || '';
                        if (firstName || lastName) {
                            const { error: backfillError } = await window.sb
                                .from('profiles')
                                .upsert({ user_id: user.id, first_name: firstName, last_name: lastName });
                            if (backfillError) {
                                console.warn('Profile backfill failed:', backfillError.message);
                            }
                        }
                    }
                    this.currentUser = { id: user.id, firstName: firstName || user.email, lastName: lastName || '', email: user.email };
                } else {
                    this.currentUser = null;
                }
            } catch (e) {
                console.warn('Auth state check failed:', e.message);
            }
        }

        if (this.currentUser) {
            document.body.classList.add('authenticated');
            userInfo?.classList.remove('hidden');
            loginNav?.classList.add('hidden');
            if (userName) userName.textContent = this.currentUser.firstName;
        } else {
            document.body.classList.remove('authenticated');
            userInfo?.classList.add('hidden');
            loginNav?.classList.remove('hidden');
        }
    }

    // Add Item Methods
    nextStep() {
        if (!this.validateCurrentStep()) return;
        
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Update progress bar
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 <= this.currentStep);
        });

        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update buttons
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const submitBtn = document.getElementById('submit-item');

        if (prevBtn) prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = this.currentStep < 3 ? 'block' : 'none';
        if (submitBtn) submitBtn.style.display = this.currentStep === 3 ? 'block' : 'none';
    }

    validateCurrentStep() {
        const currentStepEl = document.getElementById(`step-${this.currentStep}`);
        const requiredInputs = currentStepEl.querySelectorAll('[required]');
        
        for (let input of requiredInputs) {
            if (!input.value.trim()) {
                this.showToast('Please fill in all required fields', 'error');
                input.focus();
                return false;
            }
        }
        return true;
    }

    handleLocationChange(value) {
        const customGroup = document.getElementById('custom-location-group');
        if (value === 'Other') {
            customGroup.style.display = 'block';
            document.getElementById('custom-location').required = true;
        } else {
            customGroup.style.display = 'none';
            document.getElementById('custom-location').required = false;
        }
    }

    async handleAddItem() {
        if (!this.validateCurrentStep()) return;

        const title = document.getElementById('item-title').value;
        const status = document.getElementById('item-status').value;
        const category = document.getElementById('item-category').value;
        let location = document.getElementById('item-location').value;
        const description = document.getElementById('item-description').value;
        const contactEmail = document.getElementById('contact-email').value;
        const contactPhone = document.getElementById('contact-phone').value;

        if (location === 'Other') {
            location = document.getElementById('custom-location').value;
        }

        const photos = Array.from(document.querySelectorAll('.photo-preview-item img')).map(img => img.src);

        if (window.sb) {
            // Upload selected photos to Supabase Storage and collect public URLs
            let photoUrls = [];
            try {
                if (this.pendingPhotoFiles && this.pendingPhotoFiles.length > 0) {
                    const storage = window.sb.storage.from('item-photos');
                    for (let i = 0; i < this.pendingPhotoFiles.length; i++) {
                        const file = this.pendingPhotoFiles[i];
                        const safeName = (file.name || `photo_${i}`).replace(/[^a-zA-Z0-9._-]/g, '_');
                        const path = `${this.currentUser.id}/${Date.now()}_${i}_${safeName}`;
                        const { error: uploadError } = await storage.upload(path, file, { upsert: true, contentType: file.type });
                        if (uploadError) {
                            this.showToast(`Photo upload failed: ${uploadError.message}`, 'error');
                            continue;
                        }
                        const { data } = storage.getPublicUrl(path);
                        if (data && data.publicUrl) {
                            photoUrls.push(data.publicUrl);
                        }
                    }
                }
            } catch (e) {
                this.showToast('Photo upload encountered an error', 'error');
            }

            const row = {
                title,
                status,
                category,
                location,
                description,
                contact_email: contactEmail,
                contact_phone: contactPhone,
                user_id: this.currentUser.id,
                user_name: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                date_posted: new Date().toISOString().split('T')[0],
                photos: photoUrls
            };
            const { error } = await window.sb.from('items').insert(row);
            if (error) {
                this.showToast(error.message || 'Failed to post item', 'error');
                return;
            }
            await this.loadInitialData();
            this.showSuccessModal('Item Posted Successfully!', 'Your item has been posted and is now visible to other users.');
            this.resetAddItemForm();
        } else {
            const newItem = {
                id: Date.now(),
                title,
                status,
                category,
                location,
                description,
                contactEmail,
                contactPhone,
                userId: this.currentUser.id,
                userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                datePosted: new Date().toISOString().split('T')[0],
                photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop&auto=format']
            };
            this.items.unshift(newItem);
            this.showSuccessModal('Item Posted Successfully!', 'Your item has been posted and is now visible to other users.');
            this.resetAddItemForm();
        }
    }

    handlePhotoUpload(files) {
        const preview = document.getElementById('photo-preview');
        if (!this.pendingPhotoFiles) this.pendingPhotoFiles = [];
        const remainingSlots = 4 - this.pendingPhotoFiles.length;

        Array.from(files).slice(0, remainingSlots).forEach(file => {
            if (file.type && file.type.startsWith('image/')) {
                // Keep the File object for later upload to Supabase Storage
                this.pendingPhotoFiles.push(file);

                const reader = new FileReader();
                reader.onload = (e) => {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-preview-item';
                    photoItem.dataset.fileName = file.name || '';
                    photoItem.dataset.fileSize = String(file.size || 0);
                    photoItem.innerHTML = `
                        <img src="${e.target.result}" alt="Preview">
                        <button type="button" class="photo-remove">×</button>
                    `;

                    photoItem.querySelector('.photo-remove').addEventListener('click', () => {
                        // Remove from UI
                        photoItem.remove();
                        // Remove matching file from pending array
                        const idx = this.pendingPhotoFiles.findIndex(f => (f.name || '') === (photoItem.dataset.fileName || '') && String(f.size || 0) === (photoItem.dataset.fileSize || ''));
                        if (idx > -1) this.pendingPhotoFiles.splice(idx, 1);
                    });

                    preview.appendChild(photoItem);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    resetAddItemForm() {
        this.currentStep = 1;
        this.updateStepDisplay();
        document.getElementById('add-item-form')?.reset();
        document.getElementById('photo-preview').innerHTML = '';
        this.pendingPhotoFiles = [];
        document.getElementById('custom-location-group').style.display = 'none';
        
        if (this.currentUser) {
            const emailInput = document.getElementById('contact-email');
            if (emailInput) emailInput.value = this.currentUser.email;
        }
    }

    // Browse and Search Methods
    switchView(view) {
        this.currentView = view;
        
        document.querySelectorAll('.view-toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`)?.classList.add('active');

        const itemsGrid = document.getElementById('browse-items-grid');
        if (itemsGrid) {
            itemsGrid.classList.toggle('list-view', view === 'list');
        }
    }

    filterAndRenderItems() {
        const container = document.getElementById('browse-items-grid');
        const resultsCount = document.getElementById('results-count');
        const loadMoreContainer = document.getElementById('load-more-container');
        
        if (!container) return;

        let filteredItems = [...this.items];

        // Apply filters
        filteredItems = this.applyFilters(filteredItems);

        // Sort items
        filteredItems = this.sortItems(filteredItems);

        // Reset pagination
        this.currentItemsShown = this.itemsPerPage;

        // Render items
        this.renderItems(container, filteredItems);

        // Update results count
        if (resultsCount) {
            resultsCount.textContent = `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} found`;
        }

        // Show/hide load more button
        if (loadMoreContainer) {
            if (filteredItems.length > this.currentItemsShown) {
                loadMoreContainer.classList.remove('hidden');
            } else {
                loadMoreContainer.classList.add('hidden');
            }
        }

        // Store filtered items for load more
        this.filteredItems = filteredItems;
    }

    applyFilters(items) {
        // Search filter
        const searchTerm = document.getElementById('search-input')?.value.toLowerCase();
        if (searchTerm) {
            items = items.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm) ||
                item.location.toLowerCase().includes(searchTerm) ||
                item.category.toLowerCase().includes(searchTerm)
            );
        }

        // Status filter
        const statusFilter = document.getElementById('status-filter')?.value;
        if (statusFilter) {
            items = items.filter(item => item.status === statusFilter);
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter')?.value;
        if (categoryFilter) {
            items = items.filter(item => item.category === categoryFilter);
        }

        // Date filters
        const dateFrom = document.getElementById('date-from')?.value;
        const dateTo = document.getElementById('date-to')?.value;
        if (dateFrom) {
            items = items.filter(item => item.datePosted >= dateFrom);
        }
        if (dateTo) {
            items = items.filter(item => item.datePosted <= dateTo);
        }

        return items;
    }

    sortItems(items) {
        const sortBy = document.getElementById('sort-select')?.value;
        switch (sortBy) {
            case 'newest':
                return items.sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));
            case 'oldest':
                return items.sort((a, b) => new Date(a.datePosted) - new Date(b.datePosted));
            case 'title':
                return items.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return items;
        }
    }

    renderItems(container, items) {
        const itemsToShow = items.slice(0, this.currentItemsShown);
        container.innerHTML = itemsToShow.map(item => this.renderItemCard(item)).join('');
    }

    loadMoreItems() {
        this.currentItemsShown += this.itemsPerPage;
        const container = document.getElementById('browse-items-grid');
        const loadMoreContainer = document.getElementById('load-more-container');
        
        if (container && this.filteredItems) {
            this.renderItems(container, this.filteredItems);
            
            if (this.filteredItems.length <= this.currentItemsShown) {
                loadMoreContainer?.classList.add('hidden');
            }
        }
    }

    clearAllFilters() {
        const inputs = ['search-input', 'status-filter', 'category-filter', 'date-from', 'date-to'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) sortSelect.value = 'newest';
        
        this.filterAndRenderItems();
    }

    // Item Display Methods
    renderItemCard(item) {
        const photoUrl = item.photos && item.photos[0] ? item.photos[0] : 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop&auto=format';
        const idArg = typeof item.id === 'string' ? `'${item.id}'` : item.id;
        return `
            <div class="item-card" onclick="app.viewItemDetails(${idArg})">
                <div class="item-card-image">
                    <img src="${photoUrl}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop&auto=format'">
                </div>
                <div class="item-card-content">
                    <div class="item-card-header">
                        <h3 class="item-card-title">${item.title}</h3>
                        <span class="status-badge ${item.status.toLowerCase()}">${item.status}</span>
                    </div>
                    <div class="item-card-meta">
                        ${item.category} • ${item.location} • ${this.formatDate(item.datePosted || item.created_at)}
                    </div>
                    <p class="item-card-description">${item.description}</p>
                    ${this.currentUser && this.currentUser.id === item.userId ? `
                        <div class="item-card-actions">
                            <button class="btn btn--sm btn--outline" onclick="event.stopPropagation(); app.editItem(${idArg})">Edit</button>
                            <button class="btn btn--sm btn--outline delete-btn" onclick="event.stopPropagation(); app.confirmDeleteItem(${idArg})">Delete</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderRecentItems() {
        const container = document.getElementById('recent-items-grid');
        if (!container) return;

        const recentItems = this.items
            .sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted))
            .slice(0, 6);

        container.innerHTML = recentItems.map(item => this.renderItemCard(item)).join('');
    }

    // Item Details Methods
    viewItemDetails(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return;

        this.currentItem = item;
        this.currentPhotoIndex = 0;
        this.renderItemDetails(item);
        this.renderRelatedItems(item);
        this.navigateTo('item-details');
    }

    renderItemDetails(item) {
        // Update item info
        const statusEl = document.getElementById('item-details-status');
        if (statusEl) {
            statusEl.textContent = item.status;
            statusEl.className = `status-badge ${item.status.toLowerCase()}`;
        }

        const titleEl = document.getElementById('item-details-title');
        if (titleEl) titleEl.textContent = item.title;

        const categoryEl = document.getElementById('item-details-category');
        if (categoryEl) categoryEl.textContent = item.category;

        const locationEl = document.getElementById('item-details-location');
        if (locationEl) locationEl.textContent = item.location;

        const mapLocationEl = document.getElementById('item-details-map-location');
        if (mapLocationEl) mapLocationEl.textContent = item.location;

        const dateEl = document.getElementById('item-details-date');
        if (dateEl) dateEl.textContent = this.formatDate(item.datePosted);

        const userEl = document.getElementById('item-details-user');
        if (userEl) userEl.textContent = item.userName;

        const descriptionEl = document.getElementById('item-details-description');
        if (descriptionEl) descriptionEl.textContent = item.description;

        // Contact info
        const emailLink = document.getElementById('item-details-email'); 
        if (emailLink) {
            emailLink.href = `mailto:${item.contactEmail}`;
            emailLink.textContent = item.contactEmail;
        }

        const phoneContainer = document.getElementById('item-details-phone-container');
        const phoneLink = document.getElementById('item-details-phone');
        if (item.contactPhone && phoneContainer && phoneLink) {
            phoneContainer.classList.remove('hidden');
            phoneLink.href = `tel:${item.contactPhone}`;
            phoneLink.textContent = item.contactPhone;
        } else if (phoneContainer) {
            phoneContainer.classList.add('hidden');
        }

        // Owner actions
        const ownerActions = document.getElementById('owner-actions');
        const contactBtn = document.getElementById('contact-owner-btn');
        
        if (this.currentUser && this.currentUser.id === item.userId) {
            ownerActions?.classList.remove('hidden');
            contactBtn?.classList.add('hidden');
            
            // Setup edit/delete handlers
            const editBtn = document.getElementById('edit-item-btn');
            const deleteBtn = document.getElementById('delete-item-btn');
            if (editBtn) editBtn.onclick = () => this.editItem(item.id);
            if (deleteBtn) deleteBtn.onclick = () => this.confirmDeleteItem(item.id);
        } else {
            ownerActions?.classList.add('hidden');
            contactBtn?.classList.remove('hidden');
            if (contactBtn) {
                contactBtn.onclick = () => window.open(`mailto:${item.contactEmail}`, '_blank');
            }
        }

        // Setup photos
        this.setupItemPhotos(item.photos);
    }

    setupItemPhotos(photos) {
        if (!photos || photos.length === 0) {
            photos = ['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop&auto=format'];
        }

        // Main photo
        const mainPhoto = document.getElementById('main-photo');
        if (mainPhoto) {
            mainPhoto.src = photos[0];
            mainPhoto.alt = this.currentItem ? this.currentItem.title : 'Item photo';
        }

        // Thumbnails
        const thumbnailsContainer = document.getElementById('photo-thumbnails');
        if (thumbnailsContainer) {
            thumbnailsContainer.innerHTML = photos.map((photo, index) => `
                <div class="photo-thumbnail ${index === 0 ? 'active' : ''}" onclick="app.selectPhoto(${index})">
                    <img src="${photo}" alt="Photo ${index + 1}" onerror="this.src='https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop&auto=format'">
                </div>
            `).join('');
        }

        // Show/hide navigation based on photo count
        const prevBtn = document.getElementById('prev-photo');
        const nextBtn = document.getElementById('next-photo');
        if (prevBtn && nextBtn) {
            if (photos.length <= 1) {
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
        }
    }

    selectPhoto(index) {
        if (!this.currentItem || !this.currentItem.photos || index >= this.currentItem.photos.length) return;

        this.currentPhotoIndex = index;
        const mainPhoto = document.getElementById('main-photo');
        if (mainPhoto) {
            mainPhoto.src = this.currentItem.photos[index];
        }
        
        // Update thumbnails
        document.querySelectorAll('.photo-thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    previousPhoto() {
        if (!this.currentItem || !this.currentItem.photos) return;
        
        this.currentPhotoIndex = this.currentPhotoIndex > 0 
            ? this.currentPhotoIndex - 1 
            : this.currentItem.photos.length - 1;
        this.selectPhoto(this.currentPhotoIndex);
    }

    nextPhoto() {
        if (!this.currentItem || !this.currentItem.photos) return;
        
        this.currentPhotoIndex = this.currentPhotoIndex < this.currentItem.photos.length - 1 
            ? this.currentPhotoIndex + 1 
            : 0;
        this.selectPhoto(this.currentPhotoIndex);
    }

    renderRelatedItems(currentItem) {
        const container = document.getElementById('related-items-grid');
        if (!container) return;

        const relatedItems = this.items
            .filter(item => 
                item.id !== currentItem.id && 
                (item.category === currentItem.category || item.location === currentItem.location)
            )
            .slice(0, 3);

        container.innerHTML = relatedItems.map(item => this.renderItemCard(item)).join('');
    }

    // Item Management Methods
    editItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item || !this.currentUser || this.currentUser.id !== item.userId) return;

        // Populate edit form
        document.getElementById('edit-title').value = item.title;
        document.getElementById('edit-status').value = item.status;
        document.getElementById('edit-description').value = item.description;

        // Store current item being edited
        this.editingItemId = itemId;
        
        // Show edit modal
        this.showModal('edit-modal');
    }

    async handleEditItem() {
        if (!this.editingItemId) return;

        const item = this.items.find(i => i.id === this.editingItemId);
        if (!item) return;

        // Update item
        item.title = document.getElementById('edit-title').value;
        item.status = document.getElementById('edit-status').value;
        item.description = document.getElementById('edit-description').value;
        if (window.sb) {
            const { error } = await window.sb
                .from('items')
                .update({ title: item.title, status: item.status, description: item.description })
                .eq('id', this.editingItemId);
            if (error) {
                this.showToast(error.message || 'Failed to update item', 'error');
                return;
            }
            await this.loadInitialData();
        }
        this.hideModal('edit-modal');
        this.showToast('Item updated successfully', 'success');

        // Refresh current view
        if (this.currentPage === 'item-details' && this.currentItem.id === this.editingItemId) {
            this.renderItemDetails(item);
        } else if (this.currentPage === 'dashboard') {
            this.renderDashboard();
        } else if (this.currentPage === 'browse') {
            this.filterAndRenderItems();
        }

        this.editingItemId = null;
    }

    confirmDeleteItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item || !this.currentUser || this.currentUser.id !== item.userId) return;

        this.showConfirmationModal(
            'Delete Item',
            'Are you sure you want to delete this item? This action cannot be undone.',
            () => this.deleteItem(itemId)
        );
    }

    async deleteItem(itemId) {
        if (window.sb) {
            const { error } = await window.sb.from('items').delete().eq('id', itemId);
            if (error) {
                this.showToast(error.message || 'Failed to delete item', 'error');
                return;
            }
            await this.loadInitialData();
        } else {
            this.items = this.items.filter(item => item.id !== itemId);
            this.showToast('Item deleted successfully', 'success');
        }
        
        if (this.currentPage === 'item-details') {
            this.navigateTo('dashboard');
        } else if (this.currentPage === 'dashboard') {
            this.renderDashboard();
        } else if (this.currentPage === 'browse') {
            this.filterAndRenderItems();
        }
    }

    // Dashboard Methods
    switchDashboardTab(tabName) {
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.dashboard-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(`${tabName}-tab`)?.classList.add('active');
    }

    renderDashboard() {
        if (!this.currentUser) return;

        const userItems = this.items.filter(item => item.userId === this.currentUser.id);
        const lostItems = userItems.filter(item => item.status === 'Lost');
        const foundItems = userItems.filter(item => item.status === 'Found');

        // Update user name
        const dashboardUserNameEl = document.getElementById('dashboard-user-name');
        if (dashboardUserNameEl) {
            dashboardUserNameEl.textContent = this.currentUser.firstName;
        }

        // Update profile info
        const profileNameEl = document.getElementById('profile-name');
        const profileEmailEl = document.getElementById('profile-email');
        const profileFirstInput = document.getElementById('profile-firstname');
        const profileLastInput = document.getElementById('profile-lastname');
        const profileEmailInput = document.getElementById('profile-email');
        if (profileNameEl) {
            profileNameEl.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }
        if (profileEmailEl) {
            profileEmailEl.textContent = this.currentUser.email;
        }
        if (profileFirstInput) profileFirstInput.value = this.currentUser.firstName || '';
        if (profileLastInput) profileLastInput.value = this.currentUser.lastName || '';
        if (profileEmailInput && 'value' in profileEmailInput) profileEmailInput.value = this.currentUser.email || '';

        // Update stats
        this.updateElement('user-total-items', userItems.length);
        this.updateElement('user-lost-items', lostItems.length);
        this.updateElement('user-found-items', foundItems.length);
        this.updateElement('user-active-items', userItems.length);

        // Render user items
        const container = document.getElementById('user-items-grid');
        if (container) {
            if (userItems.length === 0) {
                container.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-text-secondary);">
                        <p>You haven't posted any items yet.</p>
                        <button class="btn btn--primary" data-page="add-item">Post Your First Item</button>
                    </div>
                `;
            } else {
                container.innerHTML = userItems.map(item => this.renderItemCard(item)).join('');
            }
        }
    }

    // Utility Methods
    updateStats() {
        const totalItems = this.items.length;
        const lostItems = this.items.filter(item => item.status === 'Lost').length;
        const foundItems = this.items.filter(item => item.status === 'Found').length;
        const activeUsers = [...new Set(this.items.map(item => item.userId))].length;

        this.updateElement('total-items', totalItems);
        this.updateElement('items-lost', lostItems);
        this.updateElement('items-found', foundItems);
        this.updateElement('active-users', activeUsers);
    }

    animateStatsOnLoad() {
        setTimeout(() => {
            document.querySelectorAll('.stat-number').forEach(el => {
                el.classList.add('animate');
            });
        }, 500);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Modal Methods
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('hidden');
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('hidden');
    }

    showSuccessModal(title, message) {
        const titleEl = document.getElementById('success-title');
        const messageEl = document.getElementById('success-message');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        
        this.showModal('success-modal');
    }

    showConfirmationModal(title, message, onConfirm) {
        const titleEl = document.getElementById('modal-title');  
        const messageEl = document.getElementById('modal-message');
        
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;
        
        const confirmBtn = document.getElementById('modal-confirm');
        if (confirmBtn) {
            confirmBtn.onclick = () => {
                this.hideModal('confirmation-modal');
                if (onConfirm) onConfirm();
            };
        }
        
        this.showModal('confirmation-modal');
    }

    // Toast Methods
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const messageEl = document.getElementById('toast-message');
        
        if (toast && messageEl) {
            messageEl.textContent = message;
            toast.className = `toast ${type}`;
            toast.classList.remove('hidden');

            setTimeout(() => {
                toast.classList.add('hidden');
            }, 4000);
        }
    }

    // Theme Management
    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }

    applyTheme() {
        const themeToggle = document.getElementById('theme-toggle');
        if (this.theme === 'dark') {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
            if (themeToggle) themeToggle.textContent = '☀️';
        } else {
            document.documentElement.setAttribute('data-color-scheme', 'light');
            if (themeToggle) themeToggle.textContent = '🌙';
        }
    }
}

// Initialize the application
const app = new CampusLostFoundApp();

// Export app for global access (for onclick handlers)
window.app = app;