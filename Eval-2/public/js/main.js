// Add confirmation for delete actions
document.addEventListener('DOMContentLoaded', function() {
    // Add confirmation for delete actions
    document.querySelectorAll('form[action*="delete"]').forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete this task?')) {
                e.preventDefault();
            }
        });
    });
}); 