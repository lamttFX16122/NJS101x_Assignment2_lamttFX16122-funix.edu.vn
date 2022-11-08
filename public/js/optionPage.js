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
    $('.btn-register').click(()=>{
        $('.frm-register').attr('action','/reg-Annual');
        $('#gridCheck_isHour').prop('checked', false);
        $('#fromDate').attr('disabled', false);
        $('#toDate').attr('disabled', false);
        $('#numHour').attr('disabled', true);
        $('#numHour').val('');
        $('#fromDate').val(moment().format('YYYY-MM-DD'));
        $('#toDate').val(moment().format('YYYY-MM-DD'));
        $('#cause').val('');
        $('#annual_id').val('');
        

        $('.err-cause').attr('hidden', 'hidden');
        $('.err-date').attr('hidden', 'hidden');
        $('.err-time').attr('hidden', 'hidden');
    })
    // Edit Annual
    $('.btn_edit_Annual').click((e)=>{
        let index = e.target.id; // Row
        let _isTimeAnnual = $(".tbl_Annual > tbody >tr").eq(index).children("td").eq(0).attr('id').trim();
        let _timeAnnual = $(".tbl_Annual > tbody >tr").eq(index).children("td").eq(1).attr('id').trim();
        let _fromDate = $(".tbl_Annual > tbody >tr").eq(index).children("td").eq(2).text().trim();//attr('id'); //date not parse
        let _toDate= $(".tbl_Annual > tbody >tr").eq(index).children("td").eq(3).text().trim();
        let _cause= $(".tbl_Annual > tbody >tr").eq(index).children("td").eq(4).text().trim();
        let _id= $(".tbl_Annual > tbody >tr").eq(index).children("td").eq(5).attr('id').trim();
        $('#exampleModal').modal('show');
        if(_isTimeAnnual=='true')
        {
            $('#gridCheck_isHour').prop('checked', true);
            $('#numHour').attr('disabled', false);
            $('#numHour').val(_timeAnnual);
        }
        else{
            $('#gridCheck_isHour').prop('checked', false);
            $('#numHour').attr('disabled', true);
            $('#numHour').val(_timeAnnual);
        }
        $('#fromDate').val(moment(_fromDate).format('YYYY-MM-DD'));
        $('#fromDate').attr('disabled', true);
        $('#toDate').val(moment(_toDate).format('YYYY-MM-DD'));
        $('#toDate').attr('disabled', true);
        $('#cause').val(_cause);
        $('#annual_id').val(_id);
        $('.frm-register').attr('action','/edit-Annual');

        $('.err-cause').attr('hidden', 'hidden');
        $('.err-date').attr('hidden', 'hidden');
        $('.err-time').attr('hidden', 'hidden');
    })
// Remove Annual
    $('.btn_remove_Annual').click((e)=>{
        let index = e.target.id; // Row
        let _id= $(".tbl_Annual > tbody >tr").eq(index).children("td").eq(5).attr('id').trim();
        $('#exampleModal_confirm').modal('show');     
        $('#id_removeAnnual').val(_id);      
    })
})