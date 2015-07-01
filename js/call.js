
WebitelQuickCall = function (param) {
    param = param || {};
    var quickOutgoingMediaElement = 'quickMediaElement';
    var $btnQuickCall = null;
    var theme = param['theme'] || '';

    var activeCall = null;
    var quickWebrtcPhone = null;

    var initializeQuickCallView = function(renderTo) {
        var $block = $('<div>', {
            id: renderTo + 'quick_webitel_block',
            class: 'webitel_quick_block'
        });

        var $img = $('<div>', {
            id: 'webitel_quick_btn',
            class: 'webitel_call webitel_make_call ' + theme,
            click: function () {

                if (!$btnQuickCall) $btnQuickCall = $(this);
                if ($btnQuickCall.hasClass('webitel_make_call')) {
                    startWebPhone(makeCall);
                } else {
                    quickWebrtcPhone.hangup(activeCall);
                }
            }
        });

        var $out = $('<video>', {
            id: quickOutgoingMediaElement,
            class: 'webitel_quick_video'
        });
        $('#' + renderTo).append($block.append($img, $out));
    };

    function makeCall() {
        quickWebrtcPhone.newCall({
            destination_number: param['callNumber'],
            caller_id_name: param.vertoConf['login'],
            caller_id_number: param.vertoConf['login'],
            useVideo: false,
            useStereo: false
        });
    };

    var startWebPhone = function(handle) {
        if (quickWebrtcPhone) {
            if (typeof handle == "function") {
                handle.call(this);
            };
            return;
        };

        var callbacks = {
            onMessage: function(verto, dialog, msg, data) {
                console.log('---------VERTO onMessage----------');
            },
            onDialogState: function(d) {
                console.log('---------VERTO onDialogState----------');
                switch (d.state) {
                    case $.verto.enum.state.recovering:
                        break;
                    case $.verto.enum.state.ringing:
                        $btnQuickCall.removeClass().addClass('webitel_call webitel_progress_call' + theme);
                        console.log('verto.enum.state.ringing');
                        break;

                    case $.verto.enum.state.trying:
                        break;

                    case $.verto.enum.state.early:
                    case $.verto.enum.state.active:
                        $btnQuickCall.removeClass().addClass('webitel_call webitel_active_call' + theme);
                        break;

                    case $.verto.enum.state.hangup:
                        $btnQuickCall.removeClass().addClass('webitel_call webitel_make_call' + theme);
                        console.log('verto.enum.state.hangup');
                        break;
                    case $.verto.enum.state.destroy:
                        console.log('verto.enum.state.destroy');
                        break;

                    case $.verto.enum.state.held:
                        console.log('verto.enum.state.held');
                        break;
                    default:
                        console.info(d.state);
                        break;
                }
            },
            onWSLogin: function(v, success) {
                console.log('---------VERTO onWSLogin----------');
                handle.call(this);
            },
            onWSClose: function(v, success) {
                console.log('---------VERTO onWSClose----------');
            },
            onEvent: function(v, e) {
                console.debug("GOT EVENT", e);
            }
        };
        quickWebrtcPhone = new $.verto({
            socketUrl: param.vertoConf['server'],
            login: param.vertoConf['login'],
            passwd: param.vertoConf['passwd'],
            tag: quickOutgoingMediaElement,
//                ringFile: vertoRecordFile,
//                videoParams: {
//                    "minWidth": "1280",
//                    "minHeight": "720"
//                },
            audioParams: {
                googAutoGainControl: false,
                googNoiseSuppression: false,
                googHighpassFilter: false
            },
            iceServers: false
        }, callbacks);
        quickWebrtcPhone.login();
    };

    var initializeQuickCall = function (param) {
        initializeQuickCallView(param.renderTo);
    };

    initializeQuickCall(param);
    return {
        initializeQuickCall: initializeQuickCall
    }
};