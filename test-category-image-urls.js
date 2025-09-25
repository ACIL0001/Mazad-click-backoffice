// Test script to verify both getImageUrl functions work correctly
const app = {
  route: "https://mazad-click-server.onrender.com"
};

// Simulate the getImageUrl function from CategoryDetailsPage.tsx
const getImageUrlDetails = (attachment, configApp) => {
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

// Simulate the getImageUrl function from index.tsx
const getImageUrlIndex = (attachment) => {
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
      return app.route + attachment.url;
    }
    // If it's just a filename, prepend /static/
    return app.route + '/static/' + attachment.url;
  }
  return "";
};

// Test cases
console.log("Testing both getImageUrl functions:");
console.log("=====================================");

// Test case 1: URL starts with /static/ (the problematic case from the error)
const test1 = {
  url: "/static/1758750957418-473618541.jpg"
};

console.log("Test 1 - URL starts with /static/:");
console.log("Input:", test1.url);
console.log("Details Page Output:", getImageUrlDetails(test1, app));
console.log("Index Page Output:", getImageUrlIndex(test1));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("Details ✅:", getImageUrlDetails(test1, app) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("Index ✅:", getImageUrlIndex(test1) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("");

// Test case 2: Just a filename
const test2 = {
  url: "1758750957418-473618541.jpg"
};

console.log("Test 2 - Just filename:");
console.log("Input:", test2.url);
console.log("Details Page Output:", getImageUrlDetails(test2, app));
console.log("Index Page Output:", getImageUrlIndex(test2));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("Details ✅:", getImageUrlDetails(test2, app) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("Index ✅:", getImageUrlIndex(test2) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("");

// Test case 3: Full URL already
const test3 = {
  url: "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg"
};

console.log("Test 3 - Full URL:");
console.log("Input:", test3.url);
console.log("Details Page Output:", getImageUrlDetails(test3, app));
console.log("Index Page Output:", getImageUrlIndex(test3));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("Details ✅:", getImageUrlDetails(test3, app) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("Index ✅:", getImageUrlIndex(test3) === "https://mazad-click-server.onrender.com/static/1758750957418-473618541.jpg");
console.log("");

console.log("All tests completed!");
