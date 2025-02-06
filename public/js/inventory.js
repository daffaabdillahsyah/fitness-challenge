document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const inventoryContainer = document.getElementById('inventoryContainer');

    // Add event listeners to quantity buttons
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.item-quantity');
            const itemId = input.getAttribute('data-item-id');
            const currentValue = parseInt(input.value);
            if (currentValue > 0) {
                updateItemQuantity(itemId, currentValue - 1);
            }
        });
    });

    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.parentElement.querySelector('.item-quantity');
            const itemId = input.getAttribute('data-item-id');
            const currentValue = parseInt(input.value);
            updateItemQuantity(itemId, currentValue + 1);
        });
    });

    // Function to update item quantity
    function updateItemQuantity(itemId, newQuantity) {
        if (!token) {
            showMessage("Please login to manage inventory", "warning");
            return;
        }

        if (newQuantity === 0) {
            // Remove item
            fetchMethod(`${currentUrl}/api/inventory/${itemId}`, (status, response) => {
                if (status === 200) {
                    showMessage("Item removed from inventory", "success");
                    loadInventory(); // Reload inventory
                } else {
                    showMessage(response.message || "Error removing item", "error");
                }
            }, "DELETE", null, token);
        } else {
            // Update quantity
            fetchMethod(`${currentUrl}/api/inventory/${itemId}/quantity`, (status, response) => {
                if (status === 200) {
                    const input = document.querySelector(`[data-item-id="${itemId}"]`);
                    if (input) input.value = newQuantity;
                } else {
                    showMessage(response.message || "Error updating quantity", "error");
                }
            }, "PUT", { quantity: newQuantity }, token);
        }
    }

    // Function to load inventory
    function loadInventory() {
        if (!token) {
            showMessage("Please login to view inventory", "warning");
            return;
        }

        fetchMethod(`${currentUrl}/api/inventory`, (status, response) => {
            if (status === 200) {
                inventoryContainer.innerHTML = ''; // Clear current items
                response.forEach(item => {
                    const itemHtml = `
                        <div class="col-md-6 mb-4">
                            <div class="card h-100">
                                <div class="card-body">
                                    <h5 class="card-title">${getItemEmoji(item.type)} ${item.name}</h5>
                                    <p class="card-text">${item.description}</p>
                                    <div class="d-flex justify-content-between align-items-center">
                                        <span class="badge ${getTypeBadgeClass(item.type)}">${item.type}</span>
                                        <div class="input-group" style="width: 120px;">
                                            <button class="btn btn-outline-secondary decrease-quantity" type="button">-</button>
                                            <input type="text" class="form-control text-center item-quantity" value="${item.quantity}" data-item-id="${item.id}" readonly>
                                            <button class="btn btn-outline-secondary increase-quantity" type="button">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    inventoryContainer.innerHTML += itemHtml;
                });
                // Reattach event listeners
                attachEventListeners();
            } else {
                showMessage(response.message || "Error loading inventory", "error");
            }
        }, "GET", null, token);
    }

    // Helper function to get item emoji
    function getItemEmoji(type) {
        switch (type) {
            case 'consumable': return '🧃';
            case 'equipment': return '👟';
            case 'trophy': return '🏆';
            default: return '📦';
        }
    }

    // Helper function to get badge class
    function getTypeBadgeClass(type) {
        switch (type) {
            case 'consumable': return 'bg-info';
            case 'equipment': return 'bg-primary';
            case 'trophy': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }

    // Helper function to show messages
    function showMessage(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
        setTimeout(() => alertDiv.remove(), 3000);
    }

    // Helper function to attach event listeners
    function attachEventListeners() {
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentElement.querySelector('.item-quantity');
                const itemId = input.getAttribute('data-item-id');
                const currentValue = parseInt(input.value);
                if (currentValue > 0) {
                    updateItemQuantity(itemId, currentValue - 1);
                }
            });
        });

        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const input = this.parentElement.querySelector('.item-quantity');
                const itemId = input.getAttribute('data-item-id');
                const currentValue = parseInt(input.value);
                updateItemQuantity(itemId, currentValue + 1);
            });
        });
    }

    // Load inventory when page loads
    loadInventory();
}); 