const http = require('http');

// Test webhook payloads based on Kontent.ai documentation
const testPayloads = {
  contentItemPublished: {
    notifications: [
      {
        data: {
          system: {
            id: "32022d85-ee58-4655-9016-e130c375820a",
            name: "This changes everything!",
            codename: "this_changes_everything",
            collection: "marketing",
            workflow: "default",
            workflow_step: "published",
            language: "english",
            type: "product_update",
            last_modified: "2024-01-08T13:54:54.3153716Z"
          }
        },
        message: {
          environment_id: "5f313984-9216-0158-9068-1d194f578bce",
          object_type: "content_item",
          action: "published",
          delivery_slot: "published"
        }
      }
    ]
  },
  
  assetMetadataChanged: {
    notifications: [
      {
        data: {
          system: {
            id: "f24e4721-f081-50ef-9a47-2ebd45b0c915",
            name: "sofia-patel.jpg",
            codename: "sofia_patel_jpg",
            last_modified: "2024-02-15T13:10:36.8256346Z",
            collection: "default"
          }
        },
        message: {
          environment_id: "195a50c1-f1b8-0066-9eb4-83f7246d5459",
          object_type: "asset",
          action: "metadata_changed",
          delivery_slot: "preview"
        }
      }
    ]
  },
  
  contentItemUnpublished: {
    notifications: [
      {
        data: {
          system: {
            id: "ad2db98c-f4fe-5ce7-bd99-488b6b61d280",
            name: "Solutions",
            codename: "solutions_imaging",
            collection: "ficto_imaging",
            workflow: "default",
            workflow_step: "published",
            language: "default",
            type: "navigation_item",
            last_modified: "2023-09-12T15:24:05.8881433Z"
          }
        },
        message: {
          environment_id: "195a50c1-f1b8-0066-9eb4-83f7246d5459",
          object_type: "content_item",
          action: "unpublished",
          delivery_slot: "published"
        }
      }
    ]
  }
};

function testWebhook(payloadName, payload) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(payload);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'X-Kontent-ai-Signature': 'test-signature-for-testing'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`\n📤 Test: ${payloadName}`);
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📄 Response: ${data}`);
        console.log('─'.repeat(50));
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error(`❌ Error testing ${payloadName}:`, err.message);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing Kontent.ai Webhook Server');
  console.log('─'.repeat(50));
  
  try {
    for (const [name, payload] of Object.entries(testPayloads)) {
      await testWebhook(name, payload);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('✅ All tests completed successfully!');
    console.log('\n💡 Check your server console to see the webhook processing output.');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testWebhook, testPayloads };
