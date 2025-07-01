// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    // Check if user data exists in localStorage
    const userData = JSON.parse(localStorage.getItem('lpuUserData'));
    if (!userData) {
        showLoginPage(true); // First time user
    } else {
        showLoginPage(false); // Returning user
    }
});

// document.addEventListener('DOMContentLoaded', () => {
//     showDashboard();
// });

function showLoginPage(isFirstTime) {
    fetch('components/Login.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            const form = document.getElementById('login-form');
            const profilePicInput = document.getElementById('profile-pic');
            const profilePicPreview = document.getElementById('profile-pic-preview');

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
                    let profilePicData = '';
                    if (profilePicInput && profilePicInput.files[0]) {
                        const reader = new FileReader();
                        reader.onload = function(evt) {
                            profilePicData = evt.target.result;
                            saveUserData({ name, father, mother, regId, password, profilePic: profilePicData });
                        };
                        reader.readAsDataURL(profilePicInput.files[0]);
                    } else {
                        saveUserData({ name, father, mother, regId, password, profilePic: '' });
                    }
                } else {
                    // Only reg id and password
                    const regId = document.getElementById('reg-id').value.trim();
                    const password = document.getElementById('password').value;
                    const userData = JSON.parse(localStorage.getItem('lpuUserData'));
                    if (userData && regId === userData.regId && password === userData.password) {
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
            // Logout
            document.getElementById('sideMenuLogout').addEventListener('click', function() {
                localStorage.removeItem('lpuUserData');
                closeSideMenu();
                setTimeout(() => location.reload(), 350);
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
            }
            // Add back arrow event
            const backArrow = document.getElementById('messBackArrow');
            if (backArrow) {
                backArrow.addEventListener('click', showDashboard);
            }
            // Add scanner card click events
            const mealCards = document.querySelectorAll('.mess-meal-card');
            mealCards.forEach(card => {
                card.addEventListener('click', showScannerPage);
            });
        });
}

let scannerStream = null;
function showScannerPage() {
    fetch('components/Scanner.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            // Enable camera
            const video = document.getElementById('scannerVideo');
            const canvas = document.createElement('canvas');
            let scanActive = true;
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                    .then(stream => {
                        scannerStream = stream;
                        video.srcObject = stream;
                        video.setAttribute('playsinline', true); // for iOS
                        video.play();
                        requestAnimationFrame(tick);
                    })
                    .catch(err => {
                        alert('Camera access denied or not available.');
                    });
            }
            function tick() {
                if (!scanActive) return;
                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        scanActive = false;
                        alert('QR Code detected: ' + code.data);
                        showMessFoodScanner();
                        return;
                    }
                }
                requestAnimationFrame(tick);
            }
            // Add back button event
            const backBtn = document.getElementById('scannerBackBtn');
            if (backBtn) {
                backBtn.addEventListener('click', function() {
                    scanActive = false;
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
function showMessPassPreview() {
    fetch('components/MessPass.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            // Use actual user data
            const userData = JSON.parse(localStorage.getItem('lpuUserData')) || {};
            document.getElementById('messPassProfilePic').src = userData.profilePic || 'assets/lappu.png';
            document.getElementById('messPassMealName').textContent = 'Lunch'; // You can make this dynamic if needed
            document.getElementById('messPassRegId').textContent = userData.regId || 'Reg ID';
            // Format name
            if (userData.name) {
                const formattedName = userData.name.trim().replace(/\s+/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
                document.getElementById('messPassName').textContent = formattedName;
            } else {
                document.getElementById('messPassName').textContent = 'Name';
            }
            document.getElementById('messPassMessName').textContent = 'Mess-Centre-01'; // You can make this dynamic if needed
            document.getElementById('messPassCourse').textContent = userData.course || 'P132:B.Tech. (Computer Science and Engineering)(2024)';
            const now = new Date();
            document.getElementById('messPassDate').textContent = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
            document.getElementById('messPassTime').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('messPassTimer').textContent = '30';

            // Close button event
            const closeBtn = document.getElementById('messPassCloseBtn');
            if (closeBtn) closeBtn.addEventListener('click', showDashboard);

            // TIMER LOGIC
            let timer = 30;
            const timerElem = document.getElementById('messPassTimer');
            const interval = setInterval(() => {
                timer--;
                if (timerElem) timerElem.textContent = timer;
                if (timer <= 0) {
                    clearInterval(interval);
                    // Optionally, you can add logic here to auto-close or show a message
                }
            }, 1000);
        });
}
// Temporary: Press P to preview Mess Pass page
document.addEventListener('keydown', function(e) {
    if (e.key === 'p' || e.key === 'P') {
        showMessPassPreview();
    }
});

// Add more JavaScript functionality as needed 