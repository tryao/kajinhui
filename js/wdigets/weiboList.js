/**
 * Created by yichuan on 2017/9/11.
 * postmessage for weiboList in Sinapage
 */
(function(){
    var WeiboList = function(options){
        var _options = {
            keywords : '',
            id:'',//iframe元素
            uid:'',//当前用户uid
            url:'//widget.weibo.com/hotmblog/feedlist.php?keyword=',
            distance:1000,
            fromName:'tianyi',
            hostName:'http://widget.weibo.com',
            onLoadMore:function(){}
        };
        this.options = $.extend(_options,options);
        this.init();
    };
    WeiboList.prototype = {
        init:function(){
            //初始化iframe
            var self =this;
            var opt = self.options;
            self.obj = $('#'+opt.id);
            self.status = 'start';
            //iframe之前插入loading动画
            self.loading = $('<div class="infinite cssanimation loading-logo loadinglogo">加载中...</div>');
            self.obj.before(self.loading);
            self.obj.attr('src',opt.url+self.getKeywords());
            self.bindEvent();
        },
        bindEvent:function(){
            var self = this;
            var opt = self.options;
            $(window).on('message',function(mes){
                if(mes&&mes.originalEvent){
                    self.loading.remove();
                    var _data = mes.originalEvent.data;
                    if(_data.type == 'onload'||_data.type=='lazyload'){
                        self.status = 'loaded';

                        self.changeHeight(_data.height);
                        opt.onLoadMore.call(self)
                    }
                }
            });
            $(window).on('scroll',function(){

                var _top = self.obj.offset().top;
                var _scrollTop = $(window).scrollTop();
                var _height = self.obj.height();
                if(_scrollTop-_top>_height-opt.distance&&self.status!='loading'&&self.status!='start'){
                    self.loadMore();
                }
            });
        },
        getKeywords:function(){
            var self = this;
            var opt = self.options;
            var _keyArray = opt.keywords.split(',');

            var ret = [];
            if(_keyArray.length==0)return;
            for(var i =0;i<_keyArray.length;i++){
                ret.push(encodeURIComponent(_keyArray[i]));
            }
            return ret.join(',');
        },
        changeHeight:function(height){
            var self = this;
            self.obj.attr('height',height);
        },
        loadMore:function(){
            var self = this;
            var opt = self.options;
            self.status = 'loading';
            self.obj[0].contentWindow.postMessage({
                from:opt.fromName,
                canload:true
            },opt.hostName);
        }
    };
    window.WeiboList = WeiboList;
})();