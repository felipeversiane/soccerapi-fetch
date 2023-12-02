$(document).ready(function () {
    $(document).on('change', '.checkbox-custom', function () {
        if ($('.checkbox-custom:checked').length > 0) {
            $('#searchButton').removeClass('hidden');
        } else {
            $('#searchButton').addClass('hidden');
        }
    });
});
