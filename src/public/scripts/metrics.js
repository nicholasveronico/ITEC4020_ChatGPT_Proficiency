// Declare chart instances globally so we can update them later
let accuracyChart, distributionChart, timeComparisonChart;

// Function to fetch data from the API endpoint
const fetchData = async () => {
    try {
        const response = await fetch('/analysis/summary');
        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
};

// Function to generate charts
const generateCharts = (data) => {
    const collections = data.map(item => item.collection);
    const accuracies = data.map(item => parseFloat(item.accuracy.replace('%', '')));
    const correctCounts = data.map(item => item.correctCount);
    const incorrectCounts = data.map(item => item.incorrectCount);
    const avgTimeCorrect = data.map(item => parseFloat(item.avgTimeCorrect));
    const avgTimeIncorrect = data.map(item => parseFloat(item.avgTimeIncorrect));

    // Chart 1: Bar Chart for Accuracy
    const ctx1 = document.getElementById('accuracyChart').getContext('2d');
    if (accuracyChart) accuracyChart.destroy(); // Destroy the existing chart if it exists
    accuracyChart = new Chart(ctx1, {
        type: 'bar',
        data: {
            labels: collections,
            datasets: [{
                label: 'Accuracy (%)',
                data: accuracies,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Accuracy by Collection'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Chart 2: Pie Chart for Correct vs Incorrect Answers
    const ctx2 = document.getElementById('distributionChart').getContext('2d');
    if (distributionChart) distributionChart.destroy(); // Destroy the existing chart if it exists
    distributionChart = new Chart(ctx2, {
        type: 'pie',
        data: {
            labels: ['Correct Answers', 'Incorrect Answers'],
            datasets: [{
                data: [correctCounts.reduce((a, b) => a + b, 0), incorrectCounts.reduce((a, b) => a + b, 0)],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Correct vs Incorrect Answers Distribution'
                }
            }
        }
    });

    // Chart 3: Line Chart for Time Comparison
    const ctx3 = document.getElementById('timeComparisonChart').getContext('2d');
    if (timeComparisonChart) timeComparisonChart.destroy(); // Destroy the existing chart if it exists
    timeComparisonChart = new Chart(ctx3, {
        type: 'line',
        data: {
            labels: collections,
            datasets: [
                {
                    label: 'Average Time for Correct Answers (ms)',
                    data: avgTimeCorrect,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Average Time for Incorrect Answers (ms)',
                    data: avgTimeIncorrect,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Average Time for Correct vs Incorrect Answers'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
};

// Function to update charts
const updateCharts = async () => {
    const data = await fetchData(); // Fetch latest data from the API
    if (data.length > 0) {
        generateCharts(data); // Generate or update charts with the new data
    } else {
        console.error('No data available to update charts.');
    }
};

    updateCharts();

// Add event listener to the button
document.getElementById('updateChartsButton').addEventListener('click', updateCharts);

document.addEventListener('DOMContentLoaded', async () => {
    // Initial load
    updateCharts();
});
