const fetchViewsBtn = document.getElementById("fetchViewsBtn");
const exportBtn = document.getElementById("exportBtn");
const accessTokenInput = document.getElementById("accessToken");
const fromDateInput = document.getElementById("fromDate");
const toDateInput = document.getElementById("toDate");
const videoIdsInput = document.getElementById("videoIds");
const resultsTable = document.getElementById("resultsTable");
const resultsBody = document.getElementById("resultsBody");
const loadingIndicator = document.getElementById("loading");

async function fetchVideoViews() {
  const accessToken = accessTokenInput.value.trim();
  const videoIdsText = videoIdsInput.value.trim();
  const fromDate = fromDateInput.value;
  const toDate = toDateInput.value;

  if (!accessToken) {
    alert("Please enter a Facebook Access Token!");
    return;
  }

  if (!videoIdsText) {
    alert("Please enter at least one video ID!");
    return;
  }

  if (!fromDate || !toDate) {
    alert("Please select both From and To dates!");
    return;
  }

  const videoIds = videoIdsText.split(/[\s,]+/).filter((id) => id);

  resultsBody.innerHTML = "";
  resultsTable.style.display = "none";
  exportBtn.style.display = "none";

  loadingIndicator.style.display = "block";

  for (let i = 0; i < videoIds.length; i++) {
    const videoId = videoIds[i];
    const url = `https://graph.facebook.com/v17.0/${videoId}?fields=views,post_views&access_token=${accessToken}&since=${fromDate}&until=${toDate}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        addRowToTable(
          i + 1,
          videoId,
          data.views || "N/A",
          data.post_views || "N/A"
        );
      } else {
        addRowToTable(
          i + 1,
          videoId,
          `Error: ${data.error.message}`,
          `Error: ${data.error.message}`
        );
      }
    } catch (error) {
      addRowToTable(
        i + 1,
        videoId,
        `Request failed: ${error.message}`,
        `Request failed: ${error.message}`
      );
    }

    await delay(100);
  }

  loadingIndicator.style.display = "none";
  resultsTable.style.display = "table";
  exportBtn.style.display = "block";
}

function addRowToTable(index, videoId, views, postViews) {
  const row = document.createElement("tr");

  row.innerHTML = `
        <td>${index}</td> <!-- Numbering column -->
        <td>${videoId}</td>
        <td>${views}</td>
        <td>${postViews}</td>
    `;

  resultsBody.appendChild(row);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function exportToExcel() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.table_to_sheet(document.getElementById("resultsTable"));
  XLSX.utils.book_append_sheet(wb, ws, "Facebook Video Views");
  XLSX.writeFile(wb, "facebook_video_views.xlsx");
}

fetchViewsBtn.addEventListener("click", fetchVideoViews);
exportBtn.addEventListener("click", exportToExcel);
