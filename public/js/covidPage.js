$(document).ready(() => {
    // ======================= Hypothermia============================
    // Set default button add Hypothermia
    $("#btn_addHypothermia").click(() => {
        $(".frm-register-Hypothermia").attr("action", "/hypothermia");

        $(".err-date-Hypothermia").attr("hidden", "hidden");
        $(".err-temperatureHypothermia").attr("hidden", "hidden");
        $(".err-affection").attr("hidden", "hidden");

        $("#timeHypothermia").val("");
        $("#dateHypothermia").val(moment().format("YYYY-MM-DD"));
        $("#temperatureHypothermia").val("");
        $("#affection").val("");
        $("#covid_id").val("");
        $("#hypothermia_id").val("");
    });

    //Check submit
    $(".frm-register-Hypothermia").submit(function (e) {
        const timeHypothermia = $("#timeHypothermia").val(); // Date();
        const dateHypothermia = $("#dateHypothermia").val();
        const temperatureHypothermia = $("#temperatureHypothermia").val();
        const affection = $("#affection").val();

        let err = 0;
        if (timeHypothermia === "" || dateHypothermia === "") {
            err++;
            $(".err-date-Hypothermia").removeAttr("hidden");
        } else {
            $(".err-date-Hypothermia").attr("hidden", "hidden");
        }

        if (temperatureHypothermia === "" || temperatureHypothermia <= 0) {
            err++;
            $(".err-temperatureHypothermia").removeAttr("hidden");
        } else {
            $(".err-temperatureHypothermia").attr("hidden", "hidden");
        }

        if (affection.length < 3) {
            err++;
            $(".err-affection").removeAttr("hidden");
        } else {
            $(".err-affection").attr("hidden", "hidden");
        }
        if (err === 0) {
            return;
        }
        e.preventDefault();
    });
    // ======================= End Hypothermia========================

    // Edit Hypothermia
    $(".btn_edit_Hypothermia").click((e) => {
        let index = e.target.id; // Row
        let _temperatureHypothermia = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(1).text().trim();
        let _timeHypothermia = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(1).attr("id");
        let _dateHypothermia = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(2).attr("id");
        let _affection = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(3).text().trim();
        let _idCovid = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(0).attr("id");
        let _idHypothermia = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(4).attr("id");
        $("#exampleModal_Hypothermia").modal("show");

        $("#timeHypothermia").val(_timeHypothermia);
        $("#dateHypothermia").val(_dateHypothermia);
        $("#temperatureHypothermia").val(_temperatureHypothermia);
        $("#affection").val(_affection);
        $("#covid_id").val(_idCovid);
        $("#hypothermia_id").val(_idHypothermia);

        $(".frm-register-Hypothermia").attr("action", "/edit-hypothermia");

        $(".err-date-Hypothermia").attr("hidden", "hidden");
        $(".err-temperatureHypothermia").attr("hidden", "hidden");
        $(".err-affection").attr("hidden", "hidden");
    });
    // // Remove Hypothermia
    $(".btn_remove_Hypothermia").click((e) => {
        let index = e.target.id; // Row
        let _idHypothermia = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(4).attr("id");
        let _covid_id = $(".tbl_Hypothermia > tbody >tr").eq(index).children("td").eq(0).attr("id");

        console.log(_covid_id);
        $("#exampleModal_confirm_hypothermia").modal("show");
        $("#id_removeHypothermia").val(_idHypothermia);
        $("#_removecovid_id").val(_covid_id);
    });
});
