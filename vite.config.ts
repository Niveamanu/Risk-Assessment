import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; 

// https://vite.dev/config/
export default defineConfig({
  plugins: [react() ],
  // server: {
  //   host: "localhost",
  //   port: 5173,
  // }


   server: {
    allowedHosts: [
      'riskassessment-dev.flourishresearch.com',
      'https://riskassessment-dev.flourishresearch.com'
    ]
  }
});

 