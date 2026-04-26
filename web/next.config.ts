@"
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};
export default nextConfig;
"@ | Out-File -FilePath "D:\dev\projet bot\nexus_door\web\next.config.ts" -Encoding utf8
