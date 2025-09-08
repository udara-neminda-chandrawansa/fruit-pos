// Function to load and display saved items in the table
function loadSavedItems() {
  const itemsTable = document.getElementById("itemsTable");
  const tableBody = itemsTable.querySelector("tbody");

  // Clear existing rows
  tableBody.innerHTML = "";

  // Get saved items from local storage
  const savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];

  if (savedItems.length === 0) {
    // Add a "no items" message row if there are no saved items
    const noItemsRow = document.createElement("tr");
    noItemsRow.className = "bg-white border-2 text-black";
    noItemsRow.innerHTML = `
        <td colspan="10" class="px-6 py-4 text-center">
          No items found. Please add items first.
        </td>
      `;
    tableBody.appendChild(noItemsRow);
    return;
  }

  // Add rows for each saved item
  savedItems.forEach((item, index) => {
    const formattedDate = new Date(item.dateCreated).toLocaleDateString();

    const row = document.createElement("tr");
    row.className = "bg-white border-2 text-black";
    row.dataset.itemIndex = index; // Store the item index for easy reference

    row.innerHTML = `
        <td scope="row" class="px-6 py-4 font-medium whitespace-nowrap">
          ${index + 1}
        </td>
        <td class="px-6 py-4">
          ${item.name || ""}
        </td>
        <td class="px-6 py-4">
          ${item.brand || ""}
        </td>
        <td class="px-6 py-4">
          ${item.model || ""}
        </td>
        <td class="px-6 py-4">
          ${item.imeis ? item.imeis.length : 0}
        </td>
        <td class="px-6 py-4">
          ${item.color || ""}
        </td>
        <td class="px-6 py-4">
          ${item.ram || ""}
        </td>
        <td class="px-6 py-4">
          ${item.storage || ""}
        </td>
        <td class="px-6 py-4">
          ${formattedDate}
        </td>
        <td class="px-6 py-4 flex gap-3">
          <button class="p-3 border-2 rounded-lg" 
                  data-modal-target="modal-for-view-items"
                  data-modal-toggle="modal-for-view-items" 
                  onclick="prepareImeiModal(${index})">
            Add IMEI
          </button>
          <button class="p-3 border-2 rounded-lg" 
                  onclick="editItem(${index})">
            Edit
          </button>
        </td>
      `;

    tableBody.appendChild(row);
  });
}

// Function to search items in the table
function searchItems(searchInputId, tableId, columnIndex) {
  const searchInput = document.getElementById(searchInputId);
  const table = document.getElementById(tableId);
  const searchText = searchInput.value.toLowerCase();

  const rows = table.querySelectorAll("tbody tr");

  rows.forEach((row) => {
    // Skip the "no items" row if it exists
    if (row.querySelector("td[colspan]")) {
      return;
    }

    const cells = row.getElementsByTagName("td");
    let found = false;

    // Search in all columns (not just the specified one for a more flexible search)
    for (let i = 0; i < cells.length; i++) {
      const cellText = cells[i].textContent.toLowerCase();
      if (cellText.includes(searchText)) {
        found = true;
        break;
      }
    }

    row.style.display = found ? "" : "none";
  });
}

// Function to filter table columns
function filterColumn(columnName, tableId) {
  const table = document.getElementById(tableId);
  const headers = table.querySelectorAll("thead th");
  const rows = table.querySelectorAll("tbody tr");

  // Find the column index based on column name
  let columnIndex = -1;
  headers.forEach((header, index) => {
    if (header.textContent.trim() === columnName.trim()) {
      columnIndex = index;
    }
  });

  if (columnIndex === -1) return;

  // Toggle column visibility
  const columnFilter = document.getElementById(
    `filter_${columnName.toLowerCase().replace(/\s+/g, "_")}`
  );
  const isVisible = columnFilter ? columnFilter.checked : true;

  // Toggle class on header
  if (headers[columnIndex]) {
    if (isVisible) {
      headers[columnIndex].classList.remove("hidden");
    } else {
      headers[columnIndex].classList.add("hidden");
    }
  }

  // Toggle cells in each row
  rows.forEach((row) => {
    const cells = row.getElementsByTagName("td");
    if (cells.length > columnIndex) {
      if (isVisible) {
        cells[columnIndex].classList.remove("hidden");
      } else {
        cells[columnIndex].classList.add("hidden");
      }
    }
  });
}

// Function to prepare the IMEI modal for a specific item
function prepareImeiModal(itemIndex) {
  // Store the current item index in a data attribute on the modal
  const modal = document.getElementById("modal-for-view-items");
  modal.dataset.itemIndex = itemIndex;

  // Set up the modal header
  const modalHeader = document.getElementById("modal-header");
  modalHeader.innerText = "Add IMEI";

  // Get saved items to display current IMEIs
  const savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];
  const item = savedItems[itemIndex];

  // Update the modal body to include a list of current IMEIs
  const modalBody = modal.querySelector(".p-4.md\\:p-5.space-y-4");

  // Create IMEI input container with inline button
  let imeiInputContainer = `
        <div class="flex flex-col gap-3">
          <label class="block text-sm font-medium text-black">IMEI Number</label>
          <div class="flex gap-2">
            <input type="text" id="modal-input"
                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                placeholder="Enter IMEI Number" required />
            <button type="button" onclick="addImeiToItem(${itemIndex})"
                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                Add
            </button>
          </div>
        </div>
      `;

  // Create IMEI list container
  let imeiListContainer = `
        <div class="mt-4">
          <h4 class="text-sm font-medium text-black mb-2">Current IMEIs (${
            item.imeis ? item.imeis.length : 0
          })</h4>
          <div class="max-h-40 overflow-y-auto">
            <table class="w-full text-sm text-left text-gray-500">
              <thead class="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" class="px-4 py-2">IMEI</th>
                  <th scope="col" class="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
      `;

  // Add IMEI rows
  if (item.imeis && item.imeis.length > 0) {
    item.imeis.forEach((imei, imeiIndex) => {
      imeiListContainer += `
            <tr class="bg-white border-b">
              <td class="px-4 py-2">${imei}</td>
              <td class="px-4 py-2">
                <button onclick="removeImei(${itemIndex}, ${imeiIndex})" type="button"
                    class="text-red-600 hover:underline">Remove</button>
              </td>
            </tr>
          `;
    });
  } else {
    imeiListContainer += `
          <tr class="bg-white border-b">
            <td colspan="2" class="px-4 py-2 text-center">No IMEIs added yet</td>
          </tr>
        `;
  }

  imeiListContainer += `
              </tbody>
            </table>
          </div>
        </div>
      `;

  // Update modal body
  modalBody.innerHTML = imeiInputContainer + imeiListContainer;

  // Remove the footer if it exists
  const footer = modal.querySelector(".modal-footer");
  if (footer) {
    footer.remove();
  }

  // Add enter key event listener to the input
  const input = document.getElementById("modal-input");
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addImeiToItem(itemIndex);
    }
  });

  // Focus the input
  setTimeout(() => {
    input.focus();
  }, 300);
}

// Function to add IMEI to a specific item
function addImeiToItem(itemIndex) {
  const input = document.getElementById("modal-input");
  const imei = input.value.trim();

  if (!imei) {
    alert("Please enter an IMEI number");
    return;
  }

  // Basic IMEI validation (only numbers)
  /*
  if (!/^\d+$/.test(imei)) {
    alert("IMEI should contain only numbers");
    return;
  }
  */

  // Get saved items
  const savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];
  const item = savedItems[itemIndex];

  // Initialize imeis array if it doesn't exist
  if (!item.imeis) {
    item.imeis = [];
  }

  // Check if IMEI already exists for this item
  if (item.imeis.includes(imei)) {
    alert("This IMEI already exists for this item");
    return;
  }

  // Add IMEI to the item
  item.imeis.push(imei);

  // Save updated items
  localStorage.setItem("savedItems", JSON.stringify(savedItems));

  // Clear input
  input.value = "";

  // Refresh the modal to show the updated list
  prepareImeiModal(itemIndex);

  // Refresh the table to update the IMEI count
  loadSavedItems();
}

// Function to remove an IMEI from an item
function removeImei(itemIndex, imeiIndex) {
  const savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];
  const item = savedItems[itemIndex];

  if (item.imeis && item.imeis.length > imeiIndex) {
    // Remove the IMEI
    item.imeis.splice(imeiIndex, 1);

    // Save updated items
    localStorage.setItem("savedItems", JSON.stringify(savedItems));

    // Refresh the modal
    prepareImeiModal(itemIndex);

    // Refresh the table
    loadSavedItems();
  }
}

// Function to handle editing an item
function editItem(itemIndex) {
  // Store the item index in session storage to access it on the edit page
  sessionStorage.setItem("editItemIndex", itemIndex);

  // Redirect to the edit items page
  window.location.href = "../edit-items/";
}

// Update the number of entries shown in the table
function updateEntriesShown() {
  const entriesInput = document.getElementById("col_num");
  const value = parseInt(entriesInput.value);

  if (isNaN(value) || value <= 0) {
    alert("Please enter a valid number");
    return;
  }

  const rows = document.querySelectorAll("#itemsTable tbody tr");
  rows.forEach((row, index) => {
    if (index < value) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Initialize everything when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Load saved items into the table
  loadSavedItems();

  // Set up search button event listener
  const searchButton = document.querySelector(
    "button[onclick=\"searchItems('search_item', 'itemsTable', 1);\"]"
  );
  if (searchButton) {
    searchButton.addEventListener("click", function () {
      searchItems("search_item", "itemsTable", 1);
    });
  }

  // Set up search input event listener for real-time searching
  const searchInput = document.getElementById("search_item");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      searchItems("search_item", "itemsTable", 1);
    });
  }

  // Set up entries input event listener
  const entriesInput = document.getElementById("col_num");
  if (entriesInput) {
    entriesInput.addEventListener("change", updateEntriesShown);
    // Set default value
    entriesInput.value = "30";
  }

  // Set up the column visibility toggle event listeners
  const columnFilters = document.querySelectorAll('[id^="filter_"]');
  columnFilters.forEach((filter) => {
    // Extract column name from the id
    const columnName = filter.id.replace("filter_", "").replace(/_/g, " ");
    filter.addEventListener("change", function () {
      filterColumn(columnName, "itemsTable");
    });
  });
});
