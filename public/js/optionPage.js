$(document).ready(() => {
    // Checked change
    $('#gridCheck_isHour').change(function() {
        if (this.checked) {
            $('#numHour').attr('disabled', false);
        } else {
            $('#numHour').attr('disabled', true);
        }
    })

    //Check submit
    $('.frm-register').submit(function(e) {
        const fromDate = moment($('#fromDate').val()); // Date();
        const toDate = moment($('#toDate').val());
        const cause = $('#cause').val();
        let err = 0;
        if ($('#gridCheck_isHour').is(':checked')) {
            if ($('#numHour').val() != '' && parseInt($('#numHour').val()) > 0 && parseInt($('#numHour').val()) <= 8) {
                $('.err-time').attr('hidden', 'hidden');
            } else {
                err++;
                $('.err-time').removeAttr('hidden');
            }
        }
        if (toDate.diff(fromDate, 'days') < 0) {
            err++;
            $('.err-date').removeAttr('hidden');
        } else {
            $('.err-date').attr('hidden', 'hidden');
        }

        if (cause.length < 3) {
            err++;
            $('.err-cause').removeAttr('hidden');

        } else {
            $('.err-cause').attr('hidden', 'hidden');
        }
        if (err === 0) {
            return;
        }
        e.preventDefault();
    });
})