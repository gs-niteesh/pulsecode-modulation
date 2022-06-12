function getScreen1() {
    var caption = $('#caption-input').val();
        $("#caption-text").html(caption);
        $("#panel").hide();

    html2canvas(document.getElementById('encodedWaveGraph')).then(function (canvas) {
        $("#blank").attr('href', canvas.toDataURL("image/png"));
        $("#blank").attr('download', caption + '.png');
        $("#blank")[0].click();
    });

}

function getScreen2() {
    var caption = $('#caption-input').val();
        $("#caption-text").html(caption);
        $("#panel").hide();

    html2canvas(document.getElementById('decoderWaveGraph')).then(function (canvas) {
        $("#blank").attr('href', canvas.toDataURL("image/png"));
        $("#blank").attr('download', caption + '.png');
        $("#blank")[0].click();
    });

}

function getScreen3() {
    var caption = $('#caption-input').val();
        $("#caption-text").html(caption);
        $("#panel").hide();

    html2canvas(document.getElementById('exampleModal')).then(function (canvas) {
        $("#blank").attr('href', canvas.toDataURL("image/png"));
        $("#blank").attr('download', caption + '.png');
        $("#blank")[0].click();
    });

}