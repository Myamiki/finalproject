document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("clickMe");

    button.addEventListener("click", () => {
        window.location.href = "about.html"; // Redirects to About page
    });

    const footer = document.querySelector("footer p");

    function updateDateTime() {
        const now = new Date();

        const day = now.toLocaleString('en-ZA', { day: '2-digit', timeZone: 'Africa/Johannesburg' });
        const month = now.toLocaleString('en-ZA', { month: '2-digit', timeZone: 'Africa/Johannesburg' });
        const year = now.toLocaleString('en-ZA', { year: 'numeric', timeZone: 'Africa/Johannesburg' });
        const time = now.toLocaleString('en-ZA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'Africa/Johannesburg'
        });

        footer.textContent = `${day}/${month}/${year} ${time}`;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
});
