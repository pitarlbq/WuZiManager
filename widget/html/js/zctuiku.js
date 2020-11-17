var ns;
var app = new Vue({
    el: '#app',
    data: {
        canedit: false,
        form: {
            ID: 0
        },
        zclist: [],
        zcform: {
            ID: 0,
        },
        source: 'zctuiku',
        chosenids: '',
        hideeditbtn: false
    },
    methods: {
        get_data: function() {
            var that = this;
            var options = {
                action: 'APP_GETORDERMODEL',
                ID: that.form.ID,
                ZCID: that.zcform.ID,
                source: that.source
            };
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.form = data.data;
                    if (that.form.BranchCode <= 0) {
                        that.form.BranchCode = ns.Get_Branch_Code();
                    }
                    if (that.form.DeptName == null || that.form.DeptName=='') {
                        that.form.DeptName = ns.Get_Branch_Name();
                    }
                    that.zclist = data.zclist;
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_save: function() {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('退库后公司不能为空');
                return;
            }
            if (that.form.LocationID <= 0) {
                ns.toast('退库后地点不能为空');
                return;
            }
            if (that.zclist.length == 0) {
                ns.toast('退库资产不能为空');
                return;
            }
            that.form.OrderStatus = 0;
            that.form.OrderTypeID = 10;
            that.form.FromDate = that.form.FromDateDesc;
            that.form['Items'] = that.zclist;
            var options = {
                action: 'APP_BATCHORDER_TK',
                data: JSON.stringify(that.form)
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    ns.toast('退库成功');
                    that.reload_list();
                    setTimeout(function() {
                        api.closeWin();
                    }, 500);
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        reload_list: function() {
            api.sendEvent({
                name: 'do_reload_tuiku_list'
            });
            api.sendEvent({
                name: 'do_reload_zc_list'
            });
        },
        do_select_company: function () {
            var that = this;
            var title = '选择公司';
            var name = 'choosecompany_frm';
            ns.openWin(name, title, {
                source: that.source,
                BranchCode: that.form.BranchCode
            });
        },
        do_select_department: function () {
            var that = this;
            if (that.form.BranchCode <= 0) {
                ns.toast('请选择公司');
                return;
            }
            var title = '选择部门';
            var name = 'choosedepartment_frm';
            ns.openWin(name, title, {
                id: that.form.BranchCode,
                source: that.source
            });
        },
        do_select_date: function() {
            var that = this;
            api.openPicker({
                type: 'date',
                date: that.form.FromDateDesc,
                title: '选择日期'
            }, function(ret, err) {
                if (ret) {
                    var year = ret.year;
                    var month = (ret.month >= 10 ? ret.month : '0' + ret.month);
                    var day = (ret.day >= 10 ? ret.day : '0' + ret.day);
                    that.form.FromDateDesc = year + '-' + month + '-' + day;
                }
            });
        },
        do_select_location: function() {
            var that = this;
            var title = '选择存放地点';
            var name = 'chooselocation_frm';
            ns.openWin(name, title, {
                canchooselocation: true,
                source: that.source
            });
        },
        do_select_zcitem: function(item) {
            var that = this;
            item.ischecked = !item.ischecked;
        },
        do_add_zc: function() {
            var that = this;
            var name = 'choosezc_frm';
            var title = '选择资产';
            var exceptids = '';
            if (that.chosenids != '') {
                var chosenidlist = eval('(' + that.chosenids + ')');
                if (chosenidlist.length > 0) {
                    exceptids = chosenidlist.join();
                }
            }
            ns.openWin(name, title, {
                canchoosezc: true,
                status: 20,
                exceptids: exceptids,
                disablechoosestatus: true
            });
        },
        do_open_scan: function() {
            var that = this;
            ns.openDirectWin('scanner_frm', '../html/scanner_frm.html', {
                getids: true
            })
        },
        do_remove_zc: function() {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function() {
                var newlist = [];
                for (var i = 0; i < that.zclist.length; i++) {
                    var item = that.zclist[i];
                    if (!item.ischecked) {
                        newlist.push(item);
                    }
                }
                that.zclist = newlist;
                ns.toast('删除成功');
            })
        },
        get_zc_byids: function() {
            var that = this;
            var options = {
                action: 'APP_GETZCLISTBYIDS',
                ids: that.chosenids,
                status: 20
            }
            ns.post(options, function(succeed, data, err) {
                if (succeed) {
                    that.zclist = that.zclist.concat(data.list);
                } else if (err) {
                    ns.toast(err);
                }
            }, {
                toast: true
            });
        },
        do_open_operation: function() {
            var that = this;
            var name = 'zctuikubtn_frm';
            var url = 'zctuikubtn_frm.html';
            ns.openFrame(name, url, {
                type: 'push'
            });
        },
        do_remove: function() {
            var that = this;
            ns.confirm({
                msg: '确认删除?'
            }, function() {
                api.closeFrame({
                    name: 'zctuikubtn_frm'
                });
                var options = {
                    action: 'APP_DELORDER',
                    ID: that.form.ID
                }
                ns.post(options, function(succeed, data, err) {
                    if (succeed) {
                        ns.toast('删除成功');
                        app.reload_list();
                        setTimeout(function() {
                            api.closeWin();
                        }, 500);
                    } else if (err) {
                        ns.toast(err);
                    }
                }, {
                    toast: true
                });
            })
        }
    }
});
apiready = function() {
    api.parseTapmode();
    ns = window.Foresight.Util;
    app.form.ID = ns.getPageParam('id') || 0;
    app.zcform.ID = ns.getPageParam('zcid') || 0;
    app.canedit = ns.getPageParam('canedit') || false;
    app.hideeditbtn = ns.getPageParam('hideeditbtn') || false;
    setTimeout(function() {
        app.get_data();
    }, 500);
    api.addEventListener({
        name: 'do_save_tuiku'
    }, function() {
        app.do_save();
    });
    api.addEventListener({
        name: 'do_choose_zccompany_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.BranchCode = ret.value.id;
                app.form.DeptName = ret.value.name;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zcdepartment_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
              if (app.form.UserGW != ret.value.name) {
                  app.form.UserGW = ret.value.name;
                  app.form.UserName = '';
                  app.form.UserRealName = '';
              }
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zcuseuser_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value) {
                app.form.UserName = ret.value.id;
                app.form.UserRealName = ret.value.name;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_location_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value && ret.value.id) {
                app.form.LocationID = ret.value.id;
            }
            if (ret.value && ret.value.name) {
                app.form.LocTitle = ret.value.name;
            }
        }
    });
    api.addEventListener({
        name: 'do_choose_zc_complete'
    }, function(ret) {
        if (ret.value && ret.value.ids) {
            app.chosenids = ret.value.ids;
            app.get_zc_byids();
        }
    });
    api.addEventListener({
        name: 'do_getids_complete'
    }, function(ret) {
        if (ret.value && ret.value.id) {
            app.chosenids = '[' + ret.value.id + ']'
            app.get_zc_byids();
        }
        setTimeout(function() {
            api.sendEvent({
                name: 'do_close_scan',
                extra: {
                    isclose: true
                }
            });
        }, 500);
    });
    api.addEventListener({
        name: 'do_start_remove_tuiku'
    }, function(ret) {
        app.do_remove();
    });
    api.addEventListener({
        name: 'do_choose_location_complete'
    }, function(ret) {
        if (ret.value.source == app.source) {
            if (ret.value && ret.value.id) {
                app.form.LocationID = ret.value.id;
            }
            if (ret.value && ret.value.name) {
                app.form.LocTitle = ret.value.name;
            }
        }
    });
}