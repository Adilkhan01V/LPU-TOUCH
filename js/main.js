// Main JavaScript file

// document.addEventListener('DOMContentLoaded', () => {
//     // Check if user data exists in localStorage
//     const userData = JSON.parse(localStorage.getItem('lpuUserData'));
//     if (!userData) {
//         showLoginPage(true); // First time user
//     } else {
//         showLoginPage(false); // Returning user
//     }
// });

document.addEventListener('DOMContentLoaded', () => {
    // Check if user data exists in localStorage
    const userData = JSON.parse(localStorage.getItem('lpuUserData'));
    if (!userData) {
        showLoginPage(true); // First time user - show full signup form
    } else {
        // User has already signed up - go directly to dashboard
        showLoadingSkeleton();
        setTimeout(showDashboard, 1000);
    }
});

function showLoginPage(isFirstTime) {
    fetch('components/Login.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            const form = document.getElementById('login-form');
            const profilePicInput = document.getElementById('profile-pic');
            const profilePicPreview = document.getElementById('profile-pic-preview');
            const messSelect = document.getElementById('mess-select');

            if (!isFirstTime) {
                // Hide extra fields for returning users (hide the whole input-group)
                document.querySelector('.profile-pic-input').style.display = 'none';
                document.getElementById('name').closest('.input-group').style.display = 'none';
                document.getElementById('father-name').closest('.input-group').style.display = 'none';
                document.getElementById('mother-name').closest('.input-group').style.display = 'none';

                // Remove required attribute for hidden fields
                document.getElementById('name').required = false;
                document.getElementById('father-name').required = false;
                document.getElementById('mother-name').required = false;

                // Set mess select value to saved value if exists
                const userData = JSON.parse(localStorage.getItem('lpuUserData'));
                if (userData && userData.mess) {
                    messSelect.value = userData.mess;
                }
            }

            // Profile picture preview
            if (profilePicInput) {
                profilePicInput.addEventListener('change', function(e) {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(evt) {
                            profilePicPreview.src = evt.target.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            }

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                if (isFirstTime) {
                    // Collect all fields
                    const name = document.getElementById('name').value.trim();
                    const father = document.getElementById('father-name').value.trim();
                    const mother = document.getElementById('mother-name').value.trim();
                    const regId = document.getElementById('reg-id').value.trim();
                    const password = document.getElementById('password').value;
                    const mess = messSelect.value;
                    let profilePicData = '';
                    if (profilePicInput && profilePicInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(evt) {
                            profilePicData = evt.target.result;
                            saveUserData({ name, father, mother, regId, password, profilePic: profilePicData, mess });
                        };
                        reader.readAsDataURL(profilePicInput.files[0]);
                    } else {
                        saveUserData({ name, father, mother, regId, password, profilePic: '', mess });
                    }
                } else {
                    // Only reg id and password
                    const regId = document.getElementById('reg-id').value.trim();
                    const password = document.getElementById('password').value;
                    const mess = messSelect.value;
                    const userData = JSON.parse(localStorage.getItem('lpuUserData'));
                    if (userData && regId === userData.regId && password === userData.password) {
                        // Update mess if changed
                        if (mess !== userData.mess) {
                            userData.mess = mess;
                            localStorage.setItem('lpuUserData', JSON.stringify(userData));
                        }
                        showLoadingSkeleton();
                        setTimeout(showDashboard, 2000);
                    } else {
                        alert('Invalid Registration ID or Password');
                    }
                }
            });
        });
}

function saveUserData(data) {
    localStorage.setItem('lpuUserData', JSON.stringify(data));
    showLoadingSkeleton();
    setTimeout(showDashboard, 2000);
}

function showLoadingSkeleton() {
    fetch('components/LoadingSkeleton.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
        });
}

function showDashboard() {
    fetch('components/Dashboard.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            setupSideMenuEvents();
            setupMessFoodScannerCard();
        });
}

function setupSideMenuEvents() {
    // Add click event to hamburger/menu icon
    const menuIcon = document.querySelector('.dashboard-header .icon-menu');
    if (menuIcon) {
        menuIcon.style.cursor = 'pointer';
        menuIcon.addEventListener('click', openSideMenu);
    }
}

function openSideMenu() {
    fetch('components/SideMenu.html')
        .then(res => res.text())
        .then(html => {
            // Insert side menu and overlay into body
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            document.body.appendChild(tempDiv.querySelector('#sideMenuOverlay'));
            document.body.appendChild(tempDiv.querySelector('#sideMenu'));

            // Animate in
            setTimeout(() => {
                document.getElementById('sideMenu').classList.add('active');
                document.getElementById('sideMenuOverlay').classList.add('active');
            }, 10);

            // Fill user data
            const userData = JSON.parse(localStorage.getItem('lpuUserData'));
            if (userData) {
                document.getElementById('sideMenuProfilePic').src = userData.profilePic || 'assets/lappu.png';
                if (userData.name) {
                    // Format: single spaces, capitalize each word
                    const formattedName = userData.name
                        .trim()
                        .replace(/\s+/g, ' ')
                        .split(' ')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join(' ');
                    document.getElementById('sideMenuName').textContent = formattedName;
                } else {
                    document.getElementById('sideMenuName').textContent = ' ';
                }
                document.getElementById('sideMenuRegId').textContent = userData.regId || '';
                // Example course info, you can update this to be dynamic if you store it
                document.getElementById('sideMenuCourse').textContent = userData.course || 'P132:B.Tech. (Computer Science and Engineering)(2024)';
            }

            // Set icons for menu items
            const iconMap = {
                'icon-thrive': '10-to-thrive.png',
                'icon-alumni': 'alumni.png',
                'icon-assignment': 'assignment.png',
                'icon-basics': 'back_to_basics.png',
                'icon-appointment': 'doctor_appointment.png',
                'icon-campus': 'campus_tour.png',
                'icon-exit': 'laundry.png',
                'icon-doctor': 'doctor_appointment.png',
            };
            Object.entries(iconMap).forEach(([id, file]) => {
                const el = document.getElementById(id);
                if (el) {
                    el.style.backgroundImage = `url('assets/${file}')`;
                }
            });

            // Close menu on overlay click
            document.getElementById('sideMenuOverlay').addEventListener('click', closeSideMenu);
            
            // Setup hostel bed functionality
            setupHostelBedFunctionality();
            
            // Logout
            document.getElementById('sideMenuLogout').addEventListener('click', function() {
                localStorage.removeItem('lpuUserData');
                closeSideMenu();
                setTimeout(() => location.reload(), 350);
            });

            // Add click handlers for menu items
            document.querySelectorAll('.side-menu-list li').forEach(li => {
                li.addEventListener('click', function() {
                    const text = li.textContent.trim();
                    if (text === 'Doctor Appointment') {
                        closeSideMenu();
                        showMessPassPreview();
                    }
                });
            });
        });
}

function closeSideMenu() {
    const menu = document.getElementById('sideMenu');
    const overlay = document.getElementById('sideMenuOverlay');
    if (menu && overlay) {
        menu.classList.remove('active');
        overlay.classList.remove('active');
        setTimeout(() => {
            if (menu.parentNode) menu.parentNode.removeChild(menu);
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 350);
    }
}

function setupHostelBedFunctionality() {
    const hostelBedInput = document.getElementById('hostelBedInput');
    const saveHostelBedBtn = document.getElementById('saveHostelBed');
    const messSelect = document.getElementById('sideMenuMessSelect');
    const saveMessBtn = document.getElementById('saveMessSelect');
    
    if (hostelBedInput && saveHostelBedBtn) {
        // Load existing hostel bed data
        const userData = JSON.parse(localStorage.getItem('lpuUserData'));
        if (userData && userData.hostelBed) {
            hostelBedInput.value = userData.hostelBed;
        }
        
        // Save hostel bed data
        saveHostelBedBtn.addEventListener('click', function() {
            const hostelBed = hostelBedInput.value.trim();
            if (hostelBed) {
                const userData = JSON.parse(localStorage.getItem('lpuUserData')) || {};
                userData.hostelBed = hostelBed;
                localStorage.setItem('lpuUserData', JSON.stringify(userData));
                
                // Show success feedback
                saveHostelBedBtn.textContent = 'Saved!';
                saveHostelBedBtn.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
                setTimeout(() => {
                    saveHostelBedBtn.textContent = 'Save';
                    saveHostelBedBtn.style.background = 'linear-gradient(90deg, #ff6e7f 0%, #ffb86c 100%)';
                }, 1500);
            }
        });
        
        // Allow Enter key to save
        hostelBedInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                saveHostelBedBtn.click();
            }
        });
    }
    
    // Setup mess select functionality
    if (messSelect && saveMessBtn) {
        // Load existing mess data
        const userData = JSON.parse(localStorage.getItem('lpuUserData'));
        if (userData && userData.mess) {
            messSelect.value = userData.mess;
        }
        
        // Save mess selection
        saveMessBtn.addEventListener('click', function() {
            const selectedMess = messSelect.value;
            if (selectedMess) {
                const userData = JSON.parse(localStorage.getItem('lpuUserData')) || {};
                userData.mess = selectedMess;
                localStorage.setItem('lpuUserData', JSON.stringify(userData));
                
                // Show success feedback
                saveMessBtn.textContent = 'Saved!';
                saveMessBtn.style.background = 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)';
                setTimeout(() => {
                    saveMessBtn.textContent = 'Save';
                    saveMessBtn.style.background = 'linear-gradient(90deg, #ff6e7f 0%, #ffb86c 100%)';
                }, 1500);
            }
        });
    }
}

function setupMessFoodScannerCard() {
    // Find the Mess Food Scanner card (by label or alt text)
    const tiles = document.querySelectorAll('.dashboard-tile');
    tiles.forEach(tile => {
        const label = tile.querySelector('.dashboard-tile-label');
        if (label && label.textContent.trim().toLowerCase().includes('mess food scanner')) {
            tile.style.cursor = 'pointer';
            tile.addEventListener('click', showMessFoodScanner);
        }
    });
}

function showMessFoodScanner() {
    fetch('components/MessFoodScanner.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            // Fill user data
            const userData = JSON.parse(localStorage.getItem('lpuUserData'));
            if (userData) {
                document.getElementById('messProfilePic').src = userData.profilePic || 'assets/lappu.png';
                // Format name
                if (userData.name) {
                    const formattedName = userData.name.trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                    document.getElementById('messProfileName').textContent = formattedName;
                }
                document.getElementById('messFatherName').textContent = userData.father || '';
                document.getElementById('messMotherName').textContent = userData.mother || '';
                document.getElementById('messProgram').textContent = userData.course || 'P132:B.Tech. (Computer Science and Engineering)(2024)';
                
                // Display hostel bed information
                const hostelBed = userData.hostelBed || 'A417-Bed A';
                document.getElementById('messHostel').textContent = `Boys Hostel-01-${hostelBed} (Std AC 4 Seater)`;
            }
            // Add back arrow event
            const backArrow = document.getElementById('messBackArrow');
            if (backArrow) {
                backArrow.addEventListener('click', showDashboard);
            }
            // Add scanner card click events
            const mealCards = document.querySelectorAll('.mess-meal-card');
            mealCards.forEach(card => {
                card.addEventListener('click', function() {
                    const mealName = card.textContent.trim().split(' ')[0]; // Get the meal name (e.g., 'Tea')
                    showScannerPage(mealName);
                });
            });
            // Add rate us button event
            const rateUsBtn = document.querySelector('.rate-us-btn-scanner');
            if (rateUsBtn) {
                rateUsBtn.addEventListener('click', showRateUs);
            }
        });
}

let scannerStream = null;
function showScannerPage(mealName) {
    window.selectedMeal = mealName || null;
    fetch('components/Scanner.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            // Enable camera
            const video = document.getElementById('scannerVideo');
            const qrResult = document.getElementById('qrResult');
            const canvas = document.getElementById('scannerCanvas');
            const context = canvas.getContext('2d');
            let scanActive = true;
            let scanTimeout = null;
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                    .then(stream => {
                        scannerStream = stream;
                        video.srcObject = stream;
                        video.setAttribute('playsinline', true); // required for iOS
                        video.play();
                        // Wait for video and jsQR to be ready
                        function startScanLoop() {
                            if (!scanActive) return;
                            if (typeof window.jsQR !== 'function') {
                                qrResult.textContent = 'Loading scanner...';
                                setTimeout(startScanLoop, 200);
                                return;
                            }
                            if (video.readyState !== video.HAVE_ENOUGH_DATA || video.videoWidth === 0 || video.videoHeight === 0) {
                                qrResult.textContent = 'Starting camera...';
                                setTimeout(startScanLoop, 200);
                                return;
                            }
                            // Set canvas size to video size
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            // QR scanning logic
                            function tick() {
                                if (!scanActive) return;
                                if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0 && video.videoHeight > 0) {
                                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                                    const code = jsQR(imageData.data, canvas.width, canvas.height);
                                    if (code) {
                                        // Play beep sound when QR code is detected
                                        const beepSound = new Audio('assets/beep.mp3');
                                        // Configure audio for mobile speaker output
                                        beepSound.volume = 1.0;
                                        beepSound.preload = 'auto';
                                        // Ensure it plays through speaker on mobile devices
                                        if (beepSound.setSinkId) {
                                            beepSound.setSinkId('default').catch(() => {});
                                        }
                                        beepSound.play().catch(err => console.log('Could not play beep sound:', err));
                                        
                                        qrResult.textContent = 'QR Code: ' + code.data;
                                        scanActive = false;
                                        cleanupScanner();
                                        if (scanTimeout) clearTimeout(scanTimeout);
                                        // Redirect to MessPass page with meal name
                                        showMessPassPreview(window.selectedMeal);
                                    } else {
                                        qrResult.textContent = 'Scanning...';
                                    }
                                } else {
                                    qrResult.textContent = 'Camera not ready...';
                                }
                                if (scanActive) requestAnimationFrame(tick);
                            }
                            // Timeout if no QR code is found after 15 seconds
                            scanTimeout = setTimeout(() => {
                                if (scanActive) {
                                    qrResult.textContent = 'No QR code found. Try again with better lighting or a clearer code.';
                                    scanActive = false;
                                    cleanupScanner();
                                }
                            }, 15000);
                            tick();
                        }
                        // Add a small delay to allow video to initialize
                        setTimeout(startScanLoop, 300);
                    })
                    .catch(err => {
                        qrResult.textContent = 'Camera access denied or not available.';
                    });
            } else {
                qrResult.textContent = 'Camera not supported on this device.';
            }
            // Add back button event
            const backBtn = document.getElementById('scannerBackBtn');
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    scanActive = false;
                    if (scanTimeout) clearTimeout(scanTimeout);
                    showMessFoodScanner();
                });
            }
        });
}
// Clean up camera stream when navigating away from scanner
function cleanupScanner() {
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => track.stop());
        scannerStream = null;
    }
}
// Call cleanupScanner before loading dashboard or mess food scanner
const origShowDashboard = showDashboard;
showDashboard = function() { cleanupScanner(); origShowDashboard(); };
const origShowMessFoodScanner = showMessFoodScanner;
showMessFoodScanner = function() { cleanupScanner(); origShowMessFoodScanner(); };


//remove (directly access mess pass)
function showMessPassPreview(mealName) {
    fetch('components/MessPass.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            // Use actual user data
            const userData = JSON.parse(localStorage.getItem('lpuUserData')) || {};
            document.getElementById('messPassProfilePic').src = userData.profilePic || 'assets/lappu.png';
            document.getElementById('messPassMealName').textContent = mealName || 'Meal';
            document.getElementById('messPassRegId').textContent = userData.regId || 'Reg ID';
            // Format name
            if (userData.name) {
                const formattedName = userData.name.trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                document.getElementById('messPassName').textContent = formattedName;
            } else {
                document.getElementById('messPassName').textContent = 'Name';
            }
            document.getElementById('messPassMessName').textContent = userData.mess || 'Mess Name';
            document.getElementById('messPassCourse').textContent = userData.course || 'P132:B.Tech. (Computer Science and Engineering)(2024)';
            const now = new Date();
            document.getElementById('messPassDate').textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
            document.getElementById('messPassTime').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('messPassTimer').textContent = '30';

            // Close button event
            const closeBtn = document.getElementById('messPassCloseBtn');
            if (closeBtn) closeBtn.addEventListener('click', showDashboard);

            // Add rate us button event
            const rateUsBtn = document.querySelector('.rate-us-btn');
            if (rateUsBtn) {
                rateUsBtn.addEventListener('click', showRateUs);
            }

            // TIMER LOGIC
            let timer = 30;
            const timerElem = document.getElementById('messPassTimer');
            const interval = setInterval(() => {
                timer--;
                if (timerElem) timerElem.textContent = timer;
                if (timer <= 0) {
                    clearInterval(interval);
                    // Auto-close the page when timer hits 0
                    showMessFoodScanner();
                }
            }, 1000);
        });
}

function showRateUs() {
    fetch('components/RateUs.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            // Animate slide up
            setTimeout(() => {
                const card = document.querySelector('.rateus-card');
                if (card) card.style.transform = 'translateY(10%)';
            }, 10);
            // Close button event
            const closeBtn = document.getElementById('rateUsCloseBtn');
            if (closeBtn) {
                closeBtn.addEventListener('click', showDashboard);
            }
            // Rating stars interaction
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const rating = this.getAttribute('data-rating');
                    stars.forEach(s => s.classList.remove('active'));
                    for (let i = 0; i < rating; i++) {
                        stars[i].classList.add('active');
                    }
                });
            });
            // Submit button (for now, just close)
            const submitBtn = document.querySelector('.submit-rating-btn');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    const card = document.querySelector('.rateus-card');
                    if (card) {
                        card.style.transform = 'translateY(100%)';
                        setTimeout(showDashboard, 500);
                    } else {
                        showDashboard();
                    }
                });
            }
        });
}

// Temporary: Press P to preview Mess Pass page
document.addEventListener('keydown', function(e) {
    if (e.key === 'p' || e.key === 'P') {
        showMessPassPreview();
    }
});

// Add more JavaScript functionality as needed 