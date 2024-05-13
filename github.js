const githubToken = "YOUR_GITHUB_TOKEN";
const repositoryOwner = "OWNER_USERNAME";
const repositoryName = "REPOSITORY_NAME";
const filePath = "data.json"; // File path in the repository

function sendDataToGitHub(data) {
  const apiUrl = `https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${filePath}`;
  
  fetch(apiUrl, {
    method: "GET",
    headers: {
      Authorization: `token ${githubToken}`,
    },
  })
  .then(response => response.json())
  .then(fileData => {
    let newData = [];

    // Check if the file content is not empty and can be parsed as JSON
    if (fileData && fileData.content) {
      try {
        const content = atob(fileData.content);
        newData = JSON.parse(content);
      } catch (error) {
        console.error("Error parsing existing file content:", error);
      }
    }

    newData.push(data);

    return fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `token ${githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Add new data",
        content: btoa(JSON.stringify(newData)),
        sha: fileData ? fileData.sha : null,
      }),
    });
  })
  .then(response => response.json())
  .then(result => console.log("Data saved to GitHub:", result))
  .catch(error => console.error("Error saving data to GitHub:", error));
}

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
        s3Buckets.push({ url, ...s3Bucket });
      }
    });

    // Save the captured S3 buckets to GitHub
    if (s3Buckets.length > 0) {
      sendDataToGitHub({ url: tabUrl, buckets: s3Buckets });
    }
  }
});
