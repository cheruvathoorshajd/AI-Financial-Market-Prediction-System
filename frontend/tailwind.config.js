/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'apple-blue': '#007AFF',
                'apple-green': '#34C759',
                'apple-red': '#FF3B30',
            }
        },
    },
    plugins: [],
}
