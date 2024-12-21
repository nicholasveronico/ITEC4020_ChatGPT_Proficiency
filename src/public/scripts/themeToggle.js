// Toggle between dark and light mode
const modeToggle = document.getElementById('themeToggle');
const icon = document.getElementById('icon');

// Check if the user has a saved theme preference and apply it
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    icon.textContent = '🌙'; // Dark mode icon
} else {
    icon.textContent = '🌞'; // Light mode icon
}

// Event listener for the dark mode toggle button
modeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');

    if (document.body.classList.contains('dark-mode')) {
        icon.textContent = '🌙'; // Switch to dark mode icon
        localStorage.setItem('theme', 'dark'); // Save preference
    } else {
        icon.textContent = '🌞'; // Switch to light mode icon
        localStorage.setItem('theme', 'light'); // Save preference
    }
});

// Scroll effect on the homepage
document.addEventListener("DOMContentLoaded", function() {
    const divs = document.querySelectorAll(".mode-sensitive-div");

    // Observer for triggering animations when elements are visible in the viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in");
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the div is visible
    });

    divs.forEach(div => observer.observe(div));
});