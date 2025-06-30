// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
    showLoadingSkeleton();
    setTimeout(showDashboard, 2500); // Show dashboard after 2.5 seconds
});

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
        });
}

// Add more JavaScript functionality as needed 