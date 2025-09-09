const appName = "P S Pooja Bhanda";

document.title = `${appName}`;

document.querySelector('footer p').textContent = `2025 © All Rights Reserved | ${appName} | Powered by Silicon Radon Networks (Pvt) Ltd`;

class CustomSelect {
    constructor(selectElement) {
        this.selectElement = selectElement;
        this.customSelect = selectElement.closest('.custom-select');
        this.init();
    }

    init() {
        // Create trigger
        this.trigger = document.createElement('div');
        this.trigger.className = 'custom-select-trigger';
        this.trigger.textContent = this.selectElement.options[0].text;
        this.customSelect.appendChild(this.trigger);

        // Create dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'custom-select-dropdown';
        this.customSelect.appendChild(this.dropdown);

        // Create search input
        this.searchInput = document.createElement('input');
        this.searchInput.type = 'text';
        this.searchInput.className = 'custom-select-search';
        this.searchInput.placeholder = 'Search...';
        this.dropdown.appendChild(this.searchInput);

        // Create options container
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'custom-select-options';
        this.dropdown.appendChild(this.optionsContainer);

        // Populate options
        this.populateOptions();

        // Add event listeners
        this.addEventListeners();
    }

    populateOptions() {
        this.optionsContainer.innerHTML = '';
        Array.from(this.selectElement.options).forEach((option, index) => {
            if (option.value) {  // Skip default/placeholder option
                const optionElement = document.createElement('div');
                optionElement.className = 'custom-select-option';
                optionElement.textContent = option.text;
                optionElement.dataset.value = option.value;
                
                optionElement.addEventListener('click', () => {
                    this.selectOption(optionElement);
                });

                this.optionsContainer.appendChild(optionElement);
            }
        });
    }

    addEventListeners() {
        // Toggle dropdown
        this.trigger.addEventListener('click', () => {
            this.dropdown.style.display = 
                this.dropdown.style.display === 'block' ? 'none' : 'block';
            this.searchInput.value = '';
            this.filterOptions('');
            this.searchInput.focus();
        });

        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.filterOptions(e.target.value.toLowerCase());
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.customSelect.contains(e.target)) {
                this.dropdown.style.display = 'none';
            }
        });
    }

    filterOptions(searchTerm) {
        const options = this.optionsContainer.querySelectorAll('.custom-select-option');
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    }

    selectOption(optionElement) {
        // Remove selected class from all options
        this.optionsContainer.querySelectorAll('.custom-select-option')
            .forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        optionElement.classList.add('selected');

        // Update trigger text
        this.trigger.textContent = optionElement.textContent;

        // Update original select element
        this.selectElement.value = optionElement.dataset.value;

        // Hide dropdown
        this.dropdown.style.display = 'none';
    }
}

// Initialize custom selects
document.querySelectorAll('.custom-select').forEach(select => {
    const originalSelect = select.querySelector('select');
    new CustomSelect(originalSelect);
});


// for searching tables
function searchItems(searchInputID, tableID, colNo) {
    // Declare variables
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById(searchInputID);
    filter = input.value.toUpperCase();
    table = document.getElementById(tableID);
    tr = table.getElementsByTagName("tr");

    // Loop through all table rows, and hide those who don't match the search query
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[colNo];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

// for filtering columns
function filterColumn(selectedColName, tableID) {
    // Get the table and its header row
    var table = document.getElementById(tableID);
    var th = table.querySelectorAll("thead th");
    var rows = table.querySelectorAll("tbody tr");

    // Find the index of the selected column
    var colIndex = -1;
    th.forEach((header, index) => {
        if (header.textContent.trim() === selectedColName) {
            colIndex = index;
        }
    });

    if (colIndex === -1) {
        console.error("Column not found!");
        return;
    }

    // Toggle visibility of the column
    var isHidden = th[colIndex].style.display === "none";
    th[colIndex].style.display = isHidden ? "" : "none";

    rows.forEach((row) => {
        var cells = row.querySelectorAll("td");
        if (cells[colIndex]) {
            cells[colIndex].style.display = isHidden ? "" : "none";
        }
    });
}