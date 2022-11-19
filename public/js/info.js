$(document).ready(() => {
    $('#frm_changeImg').submit((e) => {
        if ($('#imageUrl')[0].files.length == 0) {
            $('.err-changeImg').prop('hidden', false)
        }
        else {
            $('.err-changeImg').prop('hidden', true)
            return;
        }
        e.preventDefault();
    })
})