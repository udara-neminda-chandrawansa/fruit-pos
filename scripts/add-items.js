// Initialize local storage for different item categories if they don't exist
function initializeLocalStorage() {
  const categories = [
    "brands",
    "models",
    "colors",
    "storages",
    "rams",
    "distributors",
    "dealers",
    "agents",
    "imeis",
  ];

  categories.forEach((category) => {
    if (!localStorage.getItem(category)) {
      localStorage.setItem(category, JSON.stringify([]));
    }
  });
}

// Create custom combobox elements for each dropdown
function createSelectDropdowns() {
  const mappings = {
    brand: "brands",
    model: "models",
    color: "colors",
    storage: "storages",
    ram: "rams",
    distributor: "distributors",
    dealer: "dealers",
    agent: "agents",
  };

  Object.keys(mappings).forEach((selectId) => {
    const selectElement = document.getElementById(selectId);
    
    // Skip if element doesn't exist
    if (!selectElement) {
      console.warn(`Select element with id '${selectId}' not found.`);
      return;
    }
    
    // Get items from storage
    const storageKey = mappings[selectId];
    const items = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    // Clear any existing options
    selectElement.innerHTML = "";
    
    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select " + selectId.charAt(0).toUpperCase() + selectId.slice(1);
    defaultOption.selected = true;
    selectElement.appendChild(defaultOption);
    
    // Add options from storage
    items.forEach((item) => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      selectElement.appendChild(option);
    });
  });
}

// Call this function when the document is loaded
document.addEventListener("DOMContentLoaded", function() {
  createSelectDropdowns();
});

// Load items from local storage and update custom comboboxes
function loadItemsFromStorage() {
  const mappings = {
    brand: "brands",
    model: "models",
    color: "colors",
    storage: "storages",
    ram: "rams",
    distributor: "distributors",
    dealer: "dealers",
    agent: "agents",
  };

  // For each dropdown, load items from local storage
  Object.keys(mappings).forEach((selectId) => {
    const storageKey = mappings[selectId];
    const selectElement = document.getElementById(selectId);
    const parentDiv = selectElement.parentElement;

    // Get the custom combobox elements
    const customCombobox = parentDiv.querySelector(".custom-combobox-wrapper");
    if (!customCombobox) return;

    const dropdownList = customCombobox.querySelector(".absolute");

    // Clear existing options
    while (dropdownList.children.length > 1) {
      dropdownList.removeChild(dropdownList.lastChild);
    }

    // Add items from local storage
    const items = JSON.parse(localStorage.getItem(storageKey)) || [];

    // Update "no items" text
    const noItemOption = dropdownList.firstChild;
    noItemOption.textContent =
      items.length === 0 ? "No items available" : "Select an option";

    // Add items to dropdown
    items.forEach((item) => {
      const option = document.createElement("div");
      option.className = "px-4 py-2 hover:bg-gray-100 cursor-pointer";
      option.textContent = item;
      option.dataset.value = item;
      option.addEventListener("click", function () {
        selectElement.value = item;
        customCombobox.querySelector(".selected-text").textContent = item;
        dropdownList.classList.add("hidden");

        // Create a change event
        const event = new Event("change");
        selectElement.dispatchEvent(event);
      });
      dropdownList.appendChild(option);
    });

    // Keep the select element hidden
    selectElement.classList.add("hidden");
  });

  // Update IMEI count if any IMEIs exist
  const imeis = JSON.parse(localStorage.getItem("imeis")) || [];
  const qtyElement = document.querySelector('p:contains("Qty:")');
  if (qtyElement) {
    qtyElement.textContent = `Qty: ${imeis.length}`;
  }
}

// Function to add a new item
function addItem(category) {
  const input = document.getElementById("modal-input");
  const value = input.value.trim();

  if (!value) {
    alert("Please enter a value");
    return;
  }

  // Get current items from storage
  const storageKey = getCategoryStorageKey(category);
  const items = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Check if item already exists
  if (items.includes(value)) {
    alert("This item already exists");
    return;
  }

  // Add item to array and save back to local storage
  items.push(value);
  localStorage.setItem(storageKey, JSON.stringify(items));

  // Clear input
  input.value = "";

  // Reload dropdowns
  loadItemsFromStorage();

  // Update modal table
  updateModalTable(category);

  // Update selects
  createSelectDropdowns();
}

// Get storage key for a category
function getCategoryStorageKey(category) {
  const mapping = {
    brand: "brands",
    model: "models",
    color: "colors",
    storage: "storages",
    ram: "rams",
    distributor: "distributors",
    dealer: "dealers",
    agent: "agents",
    imei: "imeis",
  };

  return mapping[category];
}

// Update modal content to show a table of existing items
function updateModalTable(category) {
  const storageKey = getCategoryStorageKey(category);
  const items = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Create modal table content
  const tableHTML = `
      <div class="max-h-60 overflow-y-auto mt-4">
        <table class="w-full text-sm text-left text-gray-500">
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3">Name</th>
              <th scope="col" class="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, index) => `
              <tr class="bg-white border-b">
                <td class="px-6 py-4">${item}</td>
                <td class="px-6 py-4">
                  <button onclick="removeItem('${category}', ${index})" class="font-medium text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

  // Update modal body
  const modalBody = document.querySelector(
    "#modal-for-add-items .p-4.md\\:p-5.space-y-4"
  );

  // Clear existing table if any
  const existingTable = modalBody.querySelector(".max-h-60");
  if (existingTable) {
    existingTable.remove();
  }

  // Replace the input container with a flex layout that includes the Add button
  modalBody.innerHTML = `
      <div class="flex items-center gap-2">
        <input type="text" id="modal-input"
            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="${getPlaceholderText(category)}" required />
        <button onclick="addItem('${category}')" type="button"
            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center whitespace-nowrap">Add</button>
      </div>
      ${tableHTML}
    `;

  // Add event listener to input for Enter key
  const input = document.getElementById("modal-input");
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addItem(category);
    }
  });

  // Remove the footer buttons since we moved the Add button next to the input
  const footer = document.querySelector(
    "#modal-for-add-items .flex.items-center.justify-end"
  );
  if (footer) {
    footer.innerHTML = ``;
  }
}

// Function to remove an item
function removeItem(category, index) {
  const storageKey = getCategoryStorageKey(category);
  const items = JSON.parse(localStorage.getItem(storageKey)) || [];

  // Remove the item at the specified index
  items.splice(index, 1);
  localStorage.setItem(storageKey, JSON.stringify(items));

  // Update dropdown and modal table
  loadItemsFromStorage();
  updateModalTable(category);
}

// Get placeholder text based on category
function getPlaceholderText(category) {
  const placeholders = {
    agent: "Agent Name",
    dealer: "Dealer Name",
    distributor: "Distributor Name",
    imei: "IMEI Number",
    model: "Model Name",
    brand: "Brand Name",
    color: "Color Name",
    storage: "Storage Size",
    ram: "RAM Size",
  };

  return placeholders[category] || "";
}

// Handle IMEI additions
function addImei() {
  const input = document.getElementById("modal-input");
  const imei = input.value.trim();

  if (!imei) {
    alert("Please enter an IMEI number");
    return;
  }

  // Validate IMEI (basic validation)
  /*
  if (!/^\d+$/.test(imei)) {
    alert("IMEI should contain only numbers");
    return;
  }
  */

  // Get current IMEIs
  const imeis = JSON.parse(localStorage.getItem("imeis")) || [];

  // Check if IMEI already exists
  if (imeis.includes(imei)) {
    alert("This IMEI already exists");
    return;
  }

  // Add IMEI to storage
  imeis.push(imei);
  localStorage.setItem("imeis", JSON.stringify(imeis));

  // Update the quantity display
  const qtyElement = document.querySelector('p:contains("Qty:")');
  if (qtyElement) {
    qtyElement.textContent = `Qty: ${imeis.length}`;
  }

  // Clear input
  input.value = "";

  // Update modal table
  updateModalTable("imei");
}

// Handle image upload and display
function handleImageUpload() {
  const fileInput = document.getElementById("dropzone-file");

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (file) {
      // Check file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/svg+xml",
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a valid image file (JPG, PNG, GIF, or SVG)");
        return;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }

      // Store the image data as base64 in local storage
      const reader = new FileReader();

      reader.onload = function (event) {
        const imageData = event.target.result;
        localStorage.setItem("itemImage", imageData);

        // Display the image
        displayUploadedImage(imageData);
      };

      reader.readAsDataURL(file);
    }
  });

  // Check if there's already an image in local storage
  const savedImage = localStorage.getItem("itemImage");
  if (savedImage) {
    displayUploadedImage(savedImage);
  }

  // Add click handler to the dropzone to allow image replacement
  const dropzone = document.querySelector('label[for="dropzone-file"]');
  dropzone.addEventListener("click", function (e) {
    // This ensures the click event propagates to the hidden file input
    // even when the dropzone contains an image
    if (e.target.tagName === "IMG") {
      e.preventDefault();
      fileInput.click();
    }
  });
}

// Display the uploaded image
function displayUploadedImage(imageData) {
  const dropzone = document.querySelector('label[for="dropzone-file"]');
  const fileInput = document.getElementById("dropzone-file");

  // Replace the dropzone content with the image
  dropzone.innerHTML = `
      <div class="flex flex-col items-center justify-center w-full">
        <img src="${imageData}" class="max-h-64 object-contain mb-2" alt="Uploaded item image" />
        <p class="text-sm text-gray-500">Click to change image</p>
      </div>
    `;

  // Re-append the file input to maintain the connection
  // This is critical for allowing image replacement
  const newFileInput = document.createElement("input");
  newFileInput.id = "dropzone-file";
  newFileInput.type = "file";
  newFileInput.className = "hidden";
  newFileInput.accept = "image/*";

  // Copy event listeners from the original input
  if (fileInput) {
    const newFileInput = fileInput.cloneNode(true);
    dropzone.appendChild(newFileInput);

    // Re-attach change event listener to the new input
    newFileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        // Check file type
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
        ];
        if (!validTypes.includes(file.type)) {
          alert("Please upload a valid image file (JPG, PNG, GIF, or SVG)");
          return;
        }

        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert("File size should be less than 5MB");
          return;
        }

        // Store the new image
        const reader = new FileReader();
        reader.onload = function (event) {
          const imageData = event.target.result;
          localStorage.setItem("itemImage", imageData);
          displayUploadedImage(imageData); // Refresh the image display
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    // If original input not found, append new one
    dropzone.appendChild(newFileInput);
  }
}

// Helper function to reset the image dropzone to its original state
function resetImageDropzone() {
  const dropzone = document.querySelector('label[for="dropzone-file"]');
  dropzone.innerHTML = `
      <div class="flex flex-col items-center justify-center pt-5 pb-6">
        <svg class="w-8 h-8 mb-4 text-gray-500 " aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                stroke-width="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
        </svg>
        <p class="mb-2 text-sm text-gray-500 "><span class="font-semibold">Add image </span>here</p>
        <p class="text-xs text-gray-500 ">SVG, PNG, JPG or GIF (MAX. 800x400px)
        </p>
      </div>
      <input id="dropzone-file" type="file" class="hidden" accept="image/*" />
    `;

  // Re-attach event listener for the new file input
  const fileInput = document.getElementById("dropzone-file");
  if (fileInput) {
    fileInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        // Standard validation and processing
        const validTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/svg+xml",
        ];
        if (!validTypes.includes(file.type)) {
          alert("Please upload a valid image file (JPG, PNG, GIF, or SVG)");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("File size should be less than 5MB");
          return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
          const imageData = event.target.result;
          localStorage.setItem("itemImage", imageData);
          displayUploadedImage(imageData);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
// Save the item data
function saveItem() {
  const itemName = document.getElementById("item_name").value.trim();

  if (!itemName) {
    alert("Please enter item name");
    return;
  }

  // Get values from all fields
  const itemData = {
    name: itemName,
    brand: document.getElementById("brand").value,
    model: document.getElementById("model").value,
    description: document.getElementById("desc").value,
    color: document.getElementById("color").value,
    storage: document.getElementById("storage").value,
    ram: document.getElementById("ram").value,
    distributor: document.getElementById("distributor").value,
    dealer: document.getElementById("dealer").value,
    agent: document.getElementById("agent").value,
    // Get all price inputs
    distributorPrice: document.querySelectorAll('input[type="number"]')[0]
      .value,
    dealerPrice: document.querySelectorAll('input[type="number"]')[1].value,
    agentPrice: document.querySelectorAll('input[type="number"]')[2].value,
    tax: document.querySelectorAll('input[type="number"]')[3].value,
    mrpPrice: document.querySelectorAll('input[type="number"]')[4].value,
    purchasePrice: document.querySelectorAll('input[type="number"]')[5].value,
    // Get IMEIs
    imeis: JSON.parse(localStorage.getItem("imeis")) || [],
    // Get image
    image: localStorage.getItem("itemImage"),
    // Add date created
    dateCreated: new Date().toISOString(),
  };

  // Save item data to local storage
  const savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];
  savedItems.push(itemData);
  localStorage.setItem("savedItems", JSON.stringify(savedItems));

  // Show success message
  alert("Item saved successfully!");

  // Clear form
  document.getElementById("item_name").value = "";
  document.getElementById("desc").value = "";
  document.querySelectorAll('input[type="number"]').forEach((input) => {
    input.value = "";
  });

  // Reset comboboxes
  const selects = [
    "brand",
    "model",
    "color",
    "storage",
    "ram",
    "distributor",
    "dealer",
    "agent",
  ];
  selects.forEach((id) => {
    const select = document.getElementById(id);
    select.value = "";
    const selectedText = select.parentElement.querySelector(".selected-text");
    if (selectedText) {
      selectedText.textContent = `Select ${id}`;
    }
  });

  // Clear image
  localStorage.removeItem("itemImage");
  resetImageDropzone();

  // Clear IMEIs
  localStorage.setItem("imeis", JSON.stringify([]));
  const qtyElement = document.querySelector('p:contains("Qty:")');
  if (qtyElement) {
    qtyElement.textContent = "Qty: 0";
  }
}

// Fix for querySelector with contains selector
document.querySelector = (function (_querySelector) {
  return function (selector) {
    if (selector.includes(":contains(")) {
      const match = selector.match(/:contains\(["']?([^)"']+)["']?\)/);
      if (match) {
        const textToFind = match[1];
        const cleanSelector = selector.replace(
          /:contains\(["']?([^)"']+)["']?\)/,
          ""
        );
        const elements = document.querySelectorAll(cleanSelector);

        for (let i = 0; i < elements.length; i++) {
          if (elements[i].textContent.includes(textToFind)) {
            return elements[i];
          }
        }
        return null;
      }
    }
    return _querySelector.call(this, selector);
  };
})(document.querySelector);

// Override showModal function
window.showModal = function (whichModal) {
  const modalHeaderElement = document.getElementById("modal-header");

  // Set modal title and placeholder based on category
  switch (whichModal) {
    case "agent":
      modalHeaderElement.innerText = "Add Agent";
      break;
    case "dealer":
      modalHeaderElement.innerText = "Add Dealer";
      break;
    case "distributor":
      modalHeaderElement.innerText = "Add Distributor";
      break;
    case "imei":
      modalHeaderElement.innerText = "Add IMEI";
      break;
    case "model":
      modalHeaderElement.innerText = "Add Model";
      break;
    case "brand":
      modalHeaderElement.innerText = "Add Brand";
      break;
    case "color":
      modalHeaderElement.innerText = "Add Color";
      break;
    case "storage":
      modalHeaderElement.innerText = "Add Storage Option";
      break;
    case "ram":
      modalHeaderElement.innerText = "Add RAM Option";
      break;
    default:
      break;
  }

  // Update table in modal
  updateModalTable(whichModal);

  // Make sure the modal input is focused when the modal opens
  setTimeout(() => {
    const input = document.getElementById("modal-input");
    if (input) input.focus();
  }, 300);
};

// Initialize everything when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize local storage
  initializeLocalStorage();

  // Load items from storage and update comboboxes
  loadItemsFromStorage();

  // Initialize image upload handling
  handleImageUpload();

  // Attach event listener to the save button
  const saveButton = document.querySelector(
    ".flex.justify-center.items-center.w-full.gap-4.p-4 button"
  );
  if (saveButton) {
    saveButton.addEventListener("click", saveItem);
  }

  // Fix the modal handler for IMEIs
  const addImeiBtn = document.querySelector(
    "button[onclick=\"showModal('imei');\"]"
  );
  if (addImeiBtn) {
    addImeiBtn.onclick = function (e) {
      showModal("imei");

      // Modify the input layout to include the IMEI-specific button
      setTimeout(() => {
        const modalBody = document.querySelector(
          "#modal-for-add-items .p-4.md\\:p-5.space-y-4"
        );
        if (modalBody && modalBody.querySelector(".flex.items-center.gap-2")) {
          const inputContainer = modalBody.querySelector(
            ".flex.items-center.gap-2"
          );
          // Replace the Add button with IMEI-specific one
          const addButton = inputContainer.querySelector("button");
          if (addButton) {
            addButton.outerHTML = `
                <button onclick="addImei()" type="button"
                  class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center whitespace-nowrap">Add IMEI</button>
              `;
          }
        }
      }, 100);
    };
  }

  // Add document click event to close dropdowns when clicking outside
  document.addEventListener("click", function (e) {
    const customComboboxes = document.querySelectorAll(
      ".custom-combobox-wrapper"
    );
    customComboboxes.forEach((combobox) => {
      if (!combobox.contains(e.target)) {
        const dropdown = combobox.querySelector(".absolute");
        if (dropdown) dropdown.classList.add("hidden");
      }
    });
  });
});
