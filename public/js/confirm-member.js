$(document).ready(() => {
    $('.btn_time-remove').click((e) => {
        let index = e.target.id;
        let timeItem_id = $('#timeItemId' + index).val();
        let dayTimeItem_id = $('#dayTimeId' + index).val();

        $('#id_time_remove').val(timeItem_id);
        $('#id_daytime_remove').val(dayTimeItem_id);
        $('#staticBackdrop').modal('show');
    })
})