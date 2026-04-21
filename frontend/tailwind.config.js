/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        darknav: "#0B1233",
        softbg: "#F8F8FC"
      }
	},
  },
  plugins: [],
}

