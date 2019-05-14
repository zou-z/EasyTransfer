var path="/",dirs=new Array();
function DisplayPic(pic,name){
    $("#displaypic").show();
    $('#displaypic').find('a').attr("href","/transfer?path="+path+"&name="+name)
    $("#dispic").attr("src",pic.getElementsByTagName("img")[0].src);
}
function SelectItem(mode){
    /* mode 0:cancel_all 1:folder 2:file 3:all */
    var items=document.getElementsByClassName("item");
    for(var i=0;i<items.length;i++){
        var img=items[i].getElementsByTagName("img")[0].src,
            chbox=items[i].getElementsByTagName("input")[0];
        if(mode==0){
            chbox.checked=false;
            items[i].style.border="1px solid transparent";
        }else if(mode==3){
            chbox.checked=true;
            items[i].style.border="1px solid royalblue";
        }else if(mode==1&&"http://127.0.0.1:8000/static/images/folder.png"==img){
            chbox.checked=true;
            items[i].style.border="1px solid royalblue";
        }else if(mode==2&&"http://127.0.0.1:8000/static/images/folder.png"!=img){
            chbox.checked=true;
            items[i].style.border="1px solid royalblue";
        }
    }
}
function GetSelected(){
    var selected=new Array();
    $("input:checkbox[class=chbox]:checked").each(function(){
        selected.push($(this).val());
    });
    return selected;
}
function Upward(){
    dirs.push(path);
    for(var i=path.length-1;i>=0;i--){
        if(path[i]=="/"){
            path=path.substring(0,i);
            break;
        }
    }
    path=path==""?"/":path;
    GetFilesEx();
}
function Backward(){
    if(dirs.length>0){
        path=dirs.shift();
        GetFilesEx();
    }
}
function Check(chbox){
    if(chbox.checked){
        chbox.parentNode.parentNode.style.border="1px solid royalblue";
    }else{
        chbox.parentNode.parentNode.style.border="1px solid transparent";
    }
    window.event.stopPropagation();
}
function DisplayResult(title,link,img,name,click=""){
    $("#content").append("\
        <a class='item' href='"+link+"' title='"+title+"' onclick='"+click+"' download=''>\
            <div><input class='chbox' type='checkbox' onclick='Check(this);' value='"+name+"'/></div>\
            <img src='"+img+"'/>\
            <span>"+name+"</span>\
        </a>\
    ");
}
function GetFilesEx(){
    $.get("/getfiles?path="+path,function(res){
        if(res=="error"){
            alert("文件路径不存在!");
            return;
        }
        $("#content").empty();
        $("#path").val(path);
        $('#filepath').val(path);
        res=jQuery.parseJSON(res);
        if(!(res.folder.length|res.file.length)){
            $("#content").append("<span id='tip'>无文件!</span>");
            return;
        }
        for(var i=0;i<res.folder.length;i++){
            var title="名称: "+res.folder[i],
                link="javascript:GetFiles(\""+res.folder[i]+"\");";
            DisplayResult(title,link,"/static/images/folder.png",res.folder[i]);
        }
        for(var i=0;i<res.file.length;i++){
            var title="名称: "+res.file[i][0]+"\n大小: "+res.file[i][1],
                img="/static/images/file.png";
            if(res.file[i][2]==1){
                img="/getfiles/img?path="+path+(path=="/"?"":"/")+res.file[i][0];
                DisplayResult(title,"javascript:void(0);",img,res.file[i][0],"DisplayPic(this,\""+res.file[i][0]+"\")");
            }else{
                DisplayResult(title,"/transfer?path="+path+"&name="+res.file[i][0],img,res.file[i][0]);
            }
        }
    });
}
function GetFiles(childpath){
    path=path=="/"?(path+childpath):(path+"/"+childpath);
    GetFilesEx();
}
$(function(){
    $("#path").bind("keypress",function(event){
        if(event.keyCode=="13"){
            path=$(this).val();
            GetFilesEx();
        }
    });
    $("#uploadfile").click(function(){
        $('.upload').hide();
        var formData = new FormData($('.upload')[0]);
        $.ajax({
            type: 'post',
            url: "/transfer",
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            success:function(res){
                if(res=="success"){
                    alert("上传成功!");
                    GetFilesEx();
                }else if(res=="nofile"){
                    alert("请先选择需要上传的文件!");
                }else if(res=="existed"){
                    alert("上传失败!该文件已存在");
                }
            }
        });
    });
    $("#newdir").click(function(){
        $('.newdir').hide();
        $.post("/newdir",{path:path,name:$(".newdirtext").val()},function(res){
            if(res=="success"){
                alert("文件夹创建成功!");
                GetFilesEx();
            }else if(res=="exist"){
                alert("创建失败!该项目已存在");
            }
        });
    });
    $("#delselected").click(function(){
        var items=GetSelected();
        if(0==items.length){
            alert("请先选择需要删除的项目!");
            return;
        }
        if(confirm("确认删除已选择的"+items.length+"个项目吗?")){
            $.post("/delete",{path:path,selected:JSON.stringify(items)},function(res){
                if(res=="success"){
                    alert("删除成功!");
                    GetFilesEx();
                }else if(res=="noselected"){
                    alert("未选择需要删除的项目!");
                }else{
                    alert("删除失败!项目: "+res+"\n不存在!");
                    GetFilesEx();
                }
            });
        }
    });
    $("#start-sendmsg").click(function(){
        $(".sendmsg").hide();
        $.post("/transfermsg",{msg:$("#msgtext").val()},function(res){
            if(res=="success"){
                alert("发送完成!");
            }
        });
    });
    $(document).ready(function(){
        GetFilesEx();
    });
});