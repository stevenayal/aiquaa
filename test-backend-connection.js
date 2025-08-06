// Test script to check backend connection
const API_BASE_URL = 'http://localhost:3001';

async function testBackendConnection() {
  console.log('🔧 Testing backend connection...');
  console.log('🔧 API Base URL:', API_BASE_URL);
  
  try {
    // Test 1: Basic connectivity
    console.log('\n📝 Test 1: Basic connectivity...');
    const response = await fetch(`${API_BASE_URL}/api/comments`);
    console.log('✅ Response status:', response.status);
    console.log('✅ Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Comments found:', data.length);
      console.log('✅ First comment:', data[0] || 'No comments');
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('❌ This usually means the backend is not running');
    console.log('💡 To fix this:');
    console.log('   1. Go to the backend directory: cd backend');
    console.log('   2. Install dependencies: npm install');
    console.log('   3. Start the server: npm run dev');
    console.log('   4. Make sure it shows "Server running on port 3001"');
  }
}

// Run the test
testBackendConnection(); 