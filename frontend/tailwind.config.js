/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                discord: {
                    blurple: '#5865F2',
                    green: '#57F287',
                    yellow: '#FEE75C',
                    fuchsia: '#EB459E',
                    red: '#ED4245',
                    dark: '#2C2F33',
                    darker: '#23272A',
                    light: '#36393F'
                }
            }
        },
    },
    plugins: [],
}
