// Test script to verify the final fix for double /static/ issue
const app = {
  route: "https://mazad-click-server.onrender.com",
  getStaticUrl: (filename) => {
    const baseUrl = "https://mazad-click-server.onrender.com";
    const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
    const cleanFilename = filename.replace(/^\/+/, '');
    return `${cleanBaseUrl}/static/${cleanFilename}`;
  }
};

// Simulate the fixed getImageUrl function from both files
const getImageUrl = (attachment) => {
  if (!attachment) return "";
  
  // Handle string URLs
  if (typeof attachment === "string") {
    // If it's already a full URL, return as-is
    if (attachment.startsWith('http://') || attachment.startsWith('https://')) {
      return attachment;
    }
    // If it already starts with /static/, prepend base URL
    if (attachment.startsWith('/static/')) {
      return app.route + attachment;
    }
    // If it's just a filename, use the helper function
    return app.getStaticUrl(attachment);
  }
  
  // Handle object with url property
  if (typeof attachment === "object" && attachment.url) {
    // If it's already a full URL, return as-is
    if (attachment.url.startsWith('http://') || attachment.url.startsWith('https://')) {
      return attachment.url;
    }
    // If it already starts with /static/, prepend base URL
    if (attachment.url.startsWith('/static/')) {
      return app.route + attachment.url;
    }
    // If it's just a filename, use the helper function
    return app.getStaticUrl(attachment.url);
  }
  
  return "";
};

// Test cases
console.log("Testing final fix for double /static/ issue:");
console.log("=============================================");

// Test case 1: URL starts with /static/ (the problematic case from the error)
const test1 = {
  url: "/static/1758795507904-808043624.jpeg"
};
console.log("Test 1 - URL starts with /static/:");
console.log("Input:", test1.url);
console.log("Output:", getImageUrl(test1));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("✅ Correct:", getImageUrl(test1) === "https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("");

// Test case 2: Just a filename
const test2 = {
  url: "1758795507904-808043624.jpeg"
};
console.log("Test 2 - Just filename:");
console.log("Input:", test2.url);
console.log("Output:", getImageUrl(test2));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("✅ Correct:", getImageUrl(test2) === "https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("");

// Test case 3: Full URL already
const test3 = {
  url: "https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg"
};
console.log("Test 3 - Full URL:");
console.log("Input:", test3.url);
console.log("Output:", getImageUrl(test3));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("✅ Correct:", getImageUrl(test3) === "https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("");

// Test case 4: String input with /static/
const test4 = "/static/1758795507904-808043624.jpeg";
console.log("Test 4 - String input with /static/:");
console.log("Input:", test4);
console.log("Output:", getImageUrl(test4));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("✅ Correct:", getImageUrl(test4) === "https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("");

// Test case 5: String input with just filename
const test5 = "1758795507904-808043624.jpeg";
console.log("Test 5 - String input with just filename:");
console.log("Input:", test5);
console.log("Output:", getImageUrl(test5));
console.log("Expected: https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("✅ Correct:", getImageUrl(test5) === "https://mazad-click-server.onrender.com/static/1758795507904-808043624.jpeg");
console.log("");

console.log("All tests completed!");
