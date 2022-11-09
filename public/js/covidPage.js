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

        $("#exampleModal_confirm_hypothermia").modal("show");
        $("#id_removeHypothermia").val(_idHypothermia);
        $("#_removecovid_id").val(_covid_id);
    });
    // ======================= End Hypothermia========================

    // ======================= Vaccine================================
    // Set default button add Vaccine
    $(".btn-register-Vac").click(() => {
        $(".frm-register-vaccine").attr("action", "/vaccine");

        $(".err-numVac").attr("hidden", "hidden");
        $(".err-typeVac").attr("hidden", "hidden");

        $("#numVac").val("");
        $("#dateVac").val(moment().format("YYYY-MM-DD"));
        $("#typeVac").val("");
    });

    //Check submit
    $(".frm-register-vaccine").submit(function (e) {
        const numVac = $("#numVac").val();
        const typeVac = $("#typeVac").val();

        let err = 0;
        if (numVac === "" || numVac <= 0) {
            err++;
            $(".err-numVac").removeAttr("hidden");
        } else {
            $(".err-numVac").attr("hidden", "hidden");
        }

        if (typeVac === "") {
            err++;
            $(".err-typeVac").removeAttr("hidden");
        } else {
            $(".err-typeVac").attr("hidden", "hidden");
        }

        if (err === 0) {
            return;
        }
        e.preventDefault();
    });

    // Edit Vaccine
    $(".btn_edit_Vac").click((e) => {
        let index = e.target.id; // Row
        let _numVac = $(".tbl_Vaccine > tbody >tr").eq(index).children("td").eq(1).text().trim();
        let _dateVac = $(".tbl_Vaccine > tbody >tr").eq(index).children("td").eq(2).attr("id");
        let _typeVac = $(".tbl_Vaccine > tbody >tr").eq(index).children("td").eq(3).text().trim();

        let _idCovid = $(".tbl_Vaccine > tbody >tr").eq(index).children("td").eq(0).attr("id");
        let _idVac = $(".tbl_Vaccine > tbody >tr").eq(index).children("td").eq(4).attr("id");

        $("#exampleModal_Vaccine").modal("show");

        $("#numVac").val(_numVac);
        $("#dateVac").val(_dateVac);
        $("#typeVac").val(_typeVac);

        $("#vac_covid_id").val(_idCovid);
        $("#vac_id").val(_idVac);

        $(".frm-register-vaccine").attr("action", "/edit-vaccine");

        $(".err-numVac").attr("hidden", "hidden");
        $(".err-typeVac").attr("hidden", "hidden");
    });

    // // Remove Vaccine
    $(".btn_remove_Vac").click((e) => {
        let index = e.target.id; // Row

        let _idCovid = $(".tbl_Vaccine > tbody >tr").eq(index).children("td").eq(0).attr("id");
        let _idVac = $(".tbl_Vaccine > tbody >tr").eq(index).children("td").eq(4).attr("id");

        $("#exampleModal_confirm_Vac").modal("show");

        $("#remove_Vac_id").val(_idVac);
        $("#remove_Covid_id").val(_idCovid);
    });
    // ======================= End Vaccine============================

    // ======================= Covid================================
    // Set default button add Covid
    $(".btn-register-covid").click(() => {
        $(".frm-register-covid").attr("action", "/is-covid");

        $(".err-numCovid").attr("hidden", "hidden");
        $(".err-symptomCovid").attr("hidden", "hidden");

        $("#check_isCovid").prop("checked", false);
        $("#numCovid").val("");
        $("#dateCovid").val(moment().format("YYYY-MM-DD"));
        $("#symptomCovid").val("");
    });

    //Check submit
    $(".frm-register-covid").submit(function (e) {
        const numCovid = $("#numCovid").val();
        const symptomCovid = $("#symptomCovid").val();

        let err = 0;
        if (numCovid === "" || numCovid <= 0) {
            err++;
            $(".err-numCovid").removeAttr("hidden");
        } else {
            $(".err-numCovid").attr("hidden", "hidden");
        }

        if (symptomCovid.length < 3) {
            err++;
            $(".err-symptomCovid").removeAttr("hidden");
        } else {
            $(".err-symptomCovid").attr("hidden", "hidden");
        }

        if (err === 0) {
            return;
        }
        e.preventDefault();
    });

    // // Edit Covid
    $(".btn_edit_Covid").click((e) => {
        let index = e.target.id; // Row
        let _idCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(0).attr("id");
        let _numCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(1).text().trim();
        let _dateCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(2).attr("id");
        let _symptomCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(3).text().trim();
        let _statusCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(4).attr("id");
        let _idIsCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(5).attr("id");

        $("#exampleModal_Covid").modal("show");

        $(".frm-register-covid").attr("action", "/edit-covid");

        $(".err-numCovid").attr("hidden", "hidden");
        $(".err-symptomCovid").attr("hidden", "hidden");

        $("#check_isCovid").prop("checked", _statusCovid == "true" ? true : false);
        $("#numCovid").val(_numCovid);
        $("#dateCovid").val(_dateCovid);
        $("#symptomCovid").val(_symptomCovid);

        $("#covid_id_root").val(_idCovid);
        $("#isCovid_id").val(_idIsCovid);
    });

    // // // Remove Covid
    $(".btn_remove_Covid").click((e) => {
        let index = e.target.id; // Row

        let _idCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(0).attr("id");
        let _idIsCovid = $(".tbl_isCovid > tbody >tr").eq(index).children("td").eq(5).attr("id");

        $("#exampleModal_confirm_Covid").modal("show");

        $("#isCovid_id_root").val(_idCovid);
        $("#remove_isCovid_id").val(_idIsCovid);
    });
    // ======================= End Covid============================
});
