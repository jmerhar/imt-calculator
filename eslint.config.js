import { base, node } from "@jmerhar/frontend-config/eslint";
import { react } from "@jmerhar/frontend-config/eslint/react";

// The shared presets, with Node's globals for the data and build scripts.
export default [...base(), react(), node(["bin/**/*.mjs", "scripts/**/*.mjs"])];
