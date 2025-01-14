document.getElementById("convertText").addEventListener("click", function () {
  const file = document.getElementById("uploadFile").files[0];

  if (!file) {
    alert("Please upload a file (image or PDF).");
    return;
  }

  if (file.type === "application/pdf") {
    processScannedPDF(file);
  } else if (file.type.startsWith("image/")) {
    processImage(file);
  } else {
    alert("Invalid file type. Please upload an image or PDF.");
  }
});

// Function to process images using OCR
function processImage(image) {
  Tesseract.recognize(image, "eng", { logger: (info) => console.log(info) })
    .then(({ data: { text } }) => {
      document.getElementById("output").innerText = text;
    })
    .catch((err) => {
      console.error("OCR error with image:", err);
    });
}

// Function to process scanned PDFs using OCR
function processScannedPDF(pdfFile) {
  const reader = new FileReader();
  reader.onload = function () {
    const typedarray = new Uint8Array(this.result);

    pdfjsLib
      .getDocument(typedarray)
      .promise.then(async (pdf) => {
        console.log(`Processing ${pdf.numPages} pages`);
        let textOutput = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page onto canvas
          await page.render({ canvasContext: context, viewport: viewport })
            .promise;

          // Convert canvas to image and run OCR
          const imageData = canvas.toDataURL("image/jpeg");
          const text = await Tesseract.recognize(imageData, "eng").then(
            ({ data: { text } }) => text
          );
          textOutput += `Page ${i}:\n${text}\n\n`;
        }

        document.getElementById("output").innerText = textOutput;
        console.log("OCR complete");
      })
      .catch((err) => {
        console.error("Error processing PDF:", err);
      });
  };

  reader.readAsArrayBuffer(pdfFile);
}
