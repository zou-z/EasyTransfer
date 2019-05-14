var move_path="/",selectbg="gray",last="";
function MoveMouseOver(item){
    if(selectbg!=item.style.background){
        item.style.background="gainsboro";
    }
}
function MoveMouseOut(item){
    if(selectbg!=item.style.background){
        item.style.background="white";
    }
}
function GetMoveTarget(childpath){
    move_path=move_path=="/"?(move_path+childpath):(move_path+"/"+childpath);
    $("#move-path").html("移动到: "+move_path);
    $("#move-target").empty();
    $.get("/getfiles?path="+move_path,function(res){
        res=jQuery.parseJSON(res);
        $("#move-target").append("<li><button onclick='_MoveItemClick()' ondblclick='MoveUpward(this)' \
        onmouseover='MoveMouseOver(this)' onmouseout='MoveMouseOut(this)' title='返回上一级目录'>..</button></li>");
        for(var i=0;i<res.folder.length;i++){
            $("#move-target").append("\
            <li><button onclick='MoveItemClick(this)' ondblclick='MoveItemDblClick(this)' \
            onmouseover='MoveMouseOver(this)' onmouseout='MoveMouseOut(this)'>"+res.folder[i]+"</button></li>");
        }
    });
}
function MoveUpward(){
    if(move_path!="/"){
        for(var i=move_path.length;i>=0;i--){
            if(move_path[i]=="/"){
                move_path=move_path.substr(0,i+1);
                break;
            }
        }
    }
    GetMoveTarget("");
}
function MoveItemClick(item){
    if(last!=""){
        last.style.background="white";
    }
    item.style.background=selectbg;
    last=item;
    var _path=move_path=="/"?(move_path+item.innerHTML):(move_path+"/"+item.innerHTML);
    $("#move-path").html("移动到: "+_path);
}
function _MoveItemClick(){
    if(last!=""){
        last.style.background="white";
        last="";
    }
    $("#move-path").html("移动到: "+move_path);
}
function MoveItemDblClick(item){
    GetMoveTarget(item.innerHTML);
}
$(function(){
    $("#pre-move").click(function(){
        $(".move").slideDown(150);
        GetMoveTarget("");
    });
    $("#start-move").click(function(){
        $('.move').hide();
        var items=GetSelected(),_path=$("#move-path").html();
        if(0==items.length){
            alert("请先选择需要移动的项目!");
            return;
        }
        _path=_path.substring(5,_path.length);
        $.post("/move",{spath:path,dpath:_path,selected:JSON.stringify(items)},function(res){
            if(res=="success"){
                alert("移动完成!");
                GetFilesEx();
            }else if(res=="noselected"){
                alert("未选择需要移动的项目!");
            }else if(res=="samepath"){
                alert("未执行操作,源地址和目的地址相同!");
            }else{
                res=jQuery.parseJSON(res);
                if(res[0]=="spath_not_exist"){
                    alert("源文件: "+res[1]+" 不存在!");
                }else if(res[0]=="dpath_not_exist"){
                    alert("目标文件夹: "+res[2]+" 不存在!");
                }
            }
        });
    });
});