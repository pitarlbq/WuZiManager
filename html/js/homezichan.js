var ns, FNScanner;
var app = new Vue({
    el: '#app',
    data: {
        list: [{
            name: '资产管理',
            url: 'zcgl_frm',
            css: 'iconapplication'
        }, {
            name: '扫码',
            url: 'scanner_frm',
            css: 'iconAnkerwebicon-'
        }, {
            name: '领用&退库',
            url: 'zclytklist_frm',
            css: 'iconlingyong'
        }, {
            name: '借用&归还',
            url: 'zcjyghlist_frm',
            css: 'iconjieyong'
        }, {
            name: '盘点管理',
            url: 'pandiantasklist_frm',
            css: 'iconpandian'
        }, {
            name: '维修管理',
            url: 'weixiulist_frm',
            css: 'iconweixiu2'
        }, {
            name: '处置管理',
            url: 'chuzhilist_frm',
            css: 'iconchuzhi'
        }, ],
        countform: {
            totalcount: '',
            usecount: '',
            freecount: '',
            monthaddcount: ''
        },
        form: {
            pageindex: 1,
            pagesize: 10,
            scroll_top: 0,
            can_scroll: false,
        }
    },
    methods: {
        get_data: function() {
            var that = this;
            ns.post({
                action: 'APP_GETHOMEZCCOUNT',
            }, function(succeed, data, err) {
                if (succeed) {
                    that.countform = data;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        get_auth_actions: function() {
            var that = this;
            ns.post({
                action: 'APP_GETAUTHACTIONS',
            }, function(succeed, data, err) {
                var list = [];
                if (succeed) {
                    list = data.list;
                } else if (err) {
                    ns.toast(err);
                }
                ns.setAuthActions(list);
            });
        },
        openWin: function(item) {
            var that = this;
            if (item.url == 'scanner_frm') {
                ns.openDirectWin('scanner_frm', '../html/scanner_frm.html', {
                    getzcdetail: true
                })
                return;
            }
            var title = item.name;
            var name = item.url;
            var cansearchzc = item.url == 'zcgl_frm';
            var canaddweiuxiu = item.url == 'weixiulist_frm';
            var canaddchuzhi = item.url == 'chuzhilist_frm';
            var canaddpandian = item.url == 'pandiantasklist_frm';
            ns.openWin(name, title, {
                title: title,
                canaddweiuxiu: canaddweiuxiu,
                canaddchuzhi: canaddchuzhi,
                canaddpandian: canaddpandian,
                cansearchzc: cansearchzc,
                cansearchwx: canaddweiuxiu,
                cansearchcz: canaddchuzhi,
                cansearchpandian: canaddpandian,
            }, {
                needlogin: true
            });
        },
        open_zc: function(status) {
            var that = this;
            var title = '资产列表';
            var name = 'zcgl_frm';
            ns.openWin(name, title, {
                canedit: false,
                cansave: false,
                status: status,
                cansearchzc: true
            });
        },
        pull_refresh_init: function() {
            var that = this;
            var pullRefresh = new auiPullToRefresh({
                container: document.querySelector('.aui-refresh-content'),
                triggerDistance: 100
            }, function(ret) {
                if (ret.status == "success") {
                    setTimeout(function() {
                        that.get_data();
                        pullRefresh.cancelLoading(); //刷新成功后调用此方法隐藏
                    }, 1500)
                }
            })
            var scroll = new auiScroll({
                listen: true,
                distance: 0 //判断到达底部的距离，isToBottom为true
            }, function(ret) {
                if (ret.isToBottom && that.form.can_scroll) {
                    if (that.form.scroll_top > ret.scrollTop) {
                        that.form.scroll_top = ret.scrollTop;
                        return;
                    }
                    that.form.scroll_top = ret.scrollTop + 1;
                    that.get_data();
                }
            });
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.pull_refresh_init();
    app.get_data();
    setTimeout(function() {
        app.get_auth_actions();
    }, 1000)
    var uid = ns.getPrefs('uid');
    if (uid) {
        api.addEventListener({
            name: 'resume'
        }, function(ret, err) {
            app.get_data();
        });
    }
    api.addEventListener({
        name: 'onlogin'
    }, function() {
        app.get_data();
        setTimeout(function() {
            app.get_auth_actions();
        }, 1000)
    });
}
