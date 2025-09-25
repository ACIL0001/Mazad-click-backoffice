// Test script to verify the getImageUrl function fix
const app = {
  route: "https://mazad-click-server.onrender.com"
};

// Simulate the fixed getImageUrl function
const getImageUrl = (attachment, configApp) => {
  if (!attachment) return "";
  if (typeof attachment === "string") {
    return attachment;
  }
  if (typeof attachment === "object" && attachment.url) {
    // Check if the URL already contains the full path (starts with http/https)
    if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
      return attachment.url;
    }
    // If it's a relative path, check if it already starts with /static/
    if (attachment.url.startsWith('/static/')) {
      return configApp.route + attachment.url;
    }
    // If it's just a filename, prepend /static/
    return configApp.route + '/static/' + attachment.url;
  }
  return "";
};

// Test cases
console.log("Testing getImageUrl function fix:");
console.log("=====================================");

// Test case 1: URL already starts with /static/ (the problematic case)
const test1 = {
  url: "/static/1758750957418-473618541.jpg"
};
console.log("Test 1 - URL starts with /static/:");
console.log("Input:", test1.url);
console.log("Output:", getImageUrl(test1, app));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("✅ Correct:", getImageUrl(test1, app) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("");

// Test case 2: Just a filename
const test2 = {
  url: "1758750957418-473618541.jpg"
};
console.log("Test 2 - Just filename:");
console.log("Input:", test2.url);
console.log("Output:", getImageUrl(test2, app));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("✅ Correct:", getImageUrl(test2, app) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("");

// Test case 3: Full URL already
const test3 = {
  url: "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg"
};
console.log("Test 3 - Full URL:");
console.log("Input:", test3.url);
console.log("Output:", getImageUrl(test3, app));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("✅ Correct:", getImageUrl(test3, app) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("");

// Test case 4: Empty/null attachment
console.log("Test 4 - Empty attachment:");
console.log("Input: null");
console.log("Output:", getImageUrl(null, app));
console.log("Expected: (empty string)");
console.log("✅ Correct:", getImageUrl(null, app) === "");
console.log("");

console.log("All tests completed!");
