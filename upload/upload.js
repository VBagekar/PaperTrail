// Select the necessary DOM elements
const fileInput = document.querySelector("#fileInput");
const fileNameDisplay = document.querySelector("#fileName");
const errorMessage = document.querySelector("#error-message");
const uploadedContentBox = document.querySelector("#uploadedContentBox");
const noContentMessage = document.querySelector("#no-content-message");
const importantNotesList = document.querySelector("#important-notes-list");
const previewBox = document.querySelector("#previewBox");
const resetButton = document.querySelector("#resetButton");
const loadingSpinner = document.querySelector("#loadingSpinner");

// Maximum allowed file size (1 MB)
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB in bytes

// Event listener for file selection
fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    // Display the selected file name
    fileNameDisplay.textContent = `Selected file: ${file.name}`;

    // Check if the file size exceeds the limit
    if (file.size > MAX_FILE_SIZE) {
      errorMessage.textContent =
        "Error: File size exceeds 1 MB. Please upload a smaller file.";
      fileInput.value = ""; // Reset the file input
      return; // Stop further processing
    } else {
      errorMessage.textContent = ""; // Clear error message if file is valid
    }

    // Preview the file contents if it's a text file
    const reader = new FileReader();
    reader.onload = function (e) {
      previewBox.textContent = e.target.result.substring(0, 500); // Show the first 500 characters
    };
    reader.readAsText(file);
  }
});

// Function to handle file upload and API interaction
function handleUpload() {
  const file = fileInput.files[0];
  if (!file) {
    errorMessage.textContent = "Please select a file to upload.";
    return;
  }

  // Display loading message while the file is processed
  noContentMessage.textContent = "Processing your file...";
  loadingSpinner.style.display = "block"; // Show the loading spinner

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", "sample@sample.com_123a4b567c890d123e456f789g01"); // Replace with your actual API key
  formData.append("language", "eng"); // You can change the language code as needed

  // Send the file to OCR API
  axios
    .post("https://api.ocr.space/parse/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((response) => {
      loadingSpinner.style.display = "none"; // Hide the spinner after response
      if (response.data.OCRExitCode === 1) {
        const extractedText = response.data.ParsedResults[0].ParsedText;
        // Display the extracted text as important notes
        displayImportantNotes(extractedText.split("\n"));
      } else {
        errorMessage.textContent = `Error: ${response.data.ErrorMessage}`;
      }
    })
    .catch((error) => {
      loadingSpinner.style.display = "none"; // Hide the spinner on error
      console.error("Error uploading file:", error);
      errorMessage.textContent =
        "Error processing your file. Please try again later.";
    });
}

// Function to display important notes in bullet points
function displayImportantNotes(notes) {
  uploadedContentBox.innerHTML = ""; // Clear previous content

  // Check if notes were returned from the API
  if (notes && notes.length > 0) {
    // Hide the "no content" message
    noContentMessage.style.display = "none";

    // Create a list of bullet points for the important notes
    const ul = document.createElement("ul");
    notes.forEach((note) => {
      const li = document.createElement("li");
      li.textContent = note;

      ul.appendChild(li);
    });

    uploadedContentBox.appendChild(ul);
  } else {
    noContentMessage.textContent = "No important notes were found.";
  }
}

// PDF to CSV conversion section (if needed)
// Function to handle file upload and API interaction for PDF to CSV
function handlePdfConversion() {
  const file = fileInput.files[0];
  if (!file) {
    errorMessage.textContent = "Please select a file to upload.";
    return;
  }

  noContentMessage.textContent = "Processing your file...";
  loadingSpinner.style.display = "block"; // Show the loading spinner

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", "sample@sample.com_123a4b567c890d123e456f789g01"); // Replace with your actual API key
  formData.append("language", "eng");

  // Send the file to PDF.co API for PDF-to-CSV conversion
  const apiUrl = "https://api.pdf.co/v1/pdf/convert/to/csv";
  const data = {
    url: file.name, // You might need to upload the file to a server or storage first, and get the URL for this to work.
    lang: "eng",
    inline: true,
    pages: "0-",
    async: false,
    name: "result.csv",
  };

  fetch(apiUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-api-key": "sample@sample.com_123a4b567c890d123e456f789g01", // Replace with your API key
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((response) => {
      loadingSpinner.style.display = "none"; // Hide the spinner
      if (response.error) {
        errorMessage.textContent = `Error: ${response.error.message}`;
      } else {
        const csvData = response.body;
        // Handle the CSV data here, for example, display or download the CSV file
        displayConvertedData(csvData);
      }
    })
    .catch((error) => {
      loadingSpinner.style.display = "none"; // Hide the spinner
      console.error("Error uploading file:", error);
      errorMessage.textContent =
        "Error processing your file. Please try again later.";
    });
}

// Function to display converted data (e.g., CSV content or a link to download the file)
function displayConvertedData(data) {
  uploadedContentBox.innerHTML = ""; // Clear previous content

  // Show CSV data or a link to download the file
  const link = document.createElement("a");
  link.href = data; // Assuming `data` is a URL or the actual CSV content
  link.download = "converted_notes.csv";
  link.textContent = "Download Converted Notes (CSV)";
  uploadedContentBox.appendChild(link);
}

// Function to clean up the extracted text
function cleanText(extractedText) {
  // Remove unwanted extra spaces or line breaks
  return extractedText.replace(/\n+/g, "\n").trim();
}

// File type validation
const allowedFileTypes = ["application/pdf", "image/jpeg", "image/png"];

fileInput.addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file && !allowedFileTypes.includes(file.type)) {
    errorMessage.textContent =
      "Error: Invalid file type. Please upload a PDF or image file.";
    fileInput.value = ""; // Reset the file input
  } else {
    // File is valid, proceed with upload
  }
});

// Reset functionality
resetButton.addEventListener("click", function () {
  fileInput.value = ""; // Reset the file input
  fileNameDisplay.textContent = "";
  uploadedContentBox.innerHTML = "";
  errorMessage.textContent = "";
  noContentMessage.style.display = "block";
});
