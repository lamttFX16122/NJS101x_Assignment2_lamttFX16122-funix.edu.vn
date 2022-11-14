$(document).ready(() => {
    $('#check_sortDay').change(function () {
        if (this.checked) {
            $('.checked-sort-date').attr('hidden', false);

        } else {
            $('.checked-sort-date').attr('hidden', true);
        }
    })

    $('#link_sort').click(() => {
        let str_sort = $('#link_sort').attr('href');

        if ($('#check_sortDay').is(':checked')) {
            const sort = $('.checked-sort-date input[type="radio"][name="inlineRadioOptions"]:checked').val()
            str_sort += '&sortDay=' + sort
        }
        if ($('#check_sortPlace').is(':checked')) {
            str_sort += '&sortWorkPlace=' + true
        }
        $('#link_sort').attr('href', str_sort)
        // $('#link_sort').trigger("click");
    })
    // http://localhost:3002/lookup?page=2&pagesize=5
    // $('.frm_sort_lookup').submit(function (e) {
    //     if ($('#check_sortDay').is(':checked')) {
    //         alert('aaaaaaaaaaaa')
    //     }
    //     else {
    //         return
    //     }

    //     e.preventDefault();
    // });

})