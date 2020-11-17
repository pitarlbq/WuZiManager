var ns;
var app = new Vue({
    el: '#app',
    data: {
      list: [],
      form: {
          pageindex: 0,
          pagesize: 30,
      },
      current_item_length: 0,
      is_searching: false,
      scroll_top: 0,
      can_scroll: true
    },
    methods: {
      get_data: function() {
          var that = this;
          that.is_searching = true;
          that.can_scroll = false;
          var options = {};
          options.pageindex = that.form.pageindex;
          options.pagesize = that.form.pagesize;
          options.action = 'getnewwuyegonggaolist';
          ns.post(options, function(succeed, data, err) {
              that.is_searching = false;
              if (succeed) {
                  if (data.list.length == that.form.pagesize) {
                      that.can_scroll = true;
                  }
                  if (that.form.pageindex == 0) {
                      that.list = data.list;
                  } else {
                      that.list = that.list.concat(data.list);
                  }
                  app.current_item_length = that.list.length;

              } else if (err) {
                  that.list = [];
                  that.current_item_length = 0;
                  api.toast({
                      msg: err,
                      duration: 2000,
                      location: 'bottom'
                  });
              }
          }, { toast: true });
      },
      open_win: function(item) {
          var that = this;
          ns.openWin('dl_tongzhidetail_frm', item.title, {
              title: item.title,
              url: 'dl_tongzhidetail_frm.html',
              id: item.id
          }, { needroom: true });
      }
    }
});
apiready = function() {
  api.parseTapmode();
  ns = window.Foresight.Util;
  toast = new auiToast();
  api.addEventListener({
      name: 'savereadingpagecomplete'
  }, function() {
      app.get_data();
  });
  app.get_data();
};