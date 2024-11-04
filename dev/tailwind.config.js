/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
		"./src/app/(frontend)/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
    	extend: {
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		colors: {}
    	}
    },
	plugins: [require("tailwindcss-animate")],
};
