// Define the function to parse S3 bucket URLs
function s3ParseUrl(url) {
  var decodedUrl = decodeURIComponent(url);

  var result = null;

  // http://s3.amazonaws.com/bucket/key1/key2
  var match = decodedUrl.match(/^https?:\/\/s3.amazonaws.com\/([^\/]+)\/?(.*?)$/);
  if (match) {
    result = {
      bucket: match[1],
      key: match[2],
      region: '',
    };
  }

  // http://s3-aws-region.amazonaws.com/bucket/key1/key2
  match = decodedUrl.match(/^https?:\/\/s3-([^.]+).amazonaws.com\/([^\/]+)\/?(.*?)$/);
  if (match) {
    result = {
      bucket: match[2],
      key: match[3],
      region: match[1],
    };
  }

  // http://bucket.s3.amazonaws.com/key1/key2
  match = decodedUrl.match(/^https?:\/\/([^.]+).s3.amazonaws.com\/?(.*?)$/);
  if (match) {
    result = {
      bucket: match[1],
      key: match[2],
      region: '',
    };
  }

  // http://bucket.s3-aws-region.amazonaws.com/key1/key2 or,
  // http://bucket.s3.aws-region.amazonaws.com/key1/key2
  match = decodedUrl.match(/^https?:\/\/([^.]+).(s3-|s3\.)([^.]+).amazonaws.com\/?(.*?)$/);
  if (match) {
    result = {
      bucket: match[1],
      key: match[4],
      region: match[3],
    };
  }

  // https://s3.us-west-1.amazonaws.com/bucket/
  match = decodedUrl.match(/^https:\/\/s3\.([^/]+)\.amazonaws.com\/([^/]+)\/?$/);
  if (match) {
    result = {
      bucket: match[2],
      key: '',
      region: match[1],
    };
  }

  return result;
}

// Listen for mouse movement
document.addEventListener("mousemove", function(event) {
  // Execute the content script to extract URLs from the current tab
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.executeScript(tabs[0].id, {file: "content.js"}, function() {
      // Content script executed successfully
      console.log("Content script executed on mouse movement");
    });
  });
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    // Execute the content script when the webpage loads
    chrome.tabs.executeScript(tabId, {file: "content.js"}, function() {
      // Content script executed successfully
      console.log("Content script executed on webpage load");
    });
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "extracted_urls") {
    const urls = message.urls;
    const s3Buckets = [];
    const tabUrl = sender.tab.url; // Get the URL of the webpage where the capture happens

    // Iterate through the extracted URLs and parse S3 buckets
    urls.forEach(url => {
      const s3Bucket = s3ParseUrl(url);
      if (s3Bucket && Object.keys(s3Bucket).length !== 0) {
        // Log only if data is found
        s3Buckets.push({ url, ...s3Bucket });
      }
    });

    // Save the captured S3 buckets persistently (you may use chrome.storage API or other methods)
    // For demonstration, let's log the results along with the webpage URL
    if (s3Buckets.length > 0) {
      console.log("Captured S3 Buckets for webpage:", tabUrl, s3Buckets);
    }
  }
});

function saveToSheet(url, bucket, region) {
  var xhr = new XMLHttpRequest();
  var webAppUrl = "https://script.google.com/macros/s/AKfycbx0D-rxhD1m8_pYeisAPCNNBqSYoetttYsKL7etSAnmjpwGMCtXz0Dd0lNiuo7b3qWr/exec"; // Replace with your web app URL
  var params = "url=" + encodeURIComponent(url) + "&bucket=" + encodeURIComponent(bucket) + "&region=" + encodeURIComponent(region);
  xhr.open("POST", webAppUrl, true);
  xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log("Data saved to Google Sheets successfully");
    }
  };
  xhr.send(params);
}