import os
import json
import shutil

'''
文件夹
[名称]
文件
[名称，大小，是否为图片(0:不是 1:是)]
'''

img=['bmp','jpg','jpeg','png','gif']
def isImg(filename):
    p=len(filename)-1
    while p>=0:
        if filename[p] == ".":
            break
        p-=1
    extname=filename[p+1:]
    if extname.lower() in img:
        return 1
    return 0

def get_files(path,childpath):
    if childpath!="/":
        path+="/"+childpath
    files=os.listdir(path)
    _folder=[]
    _files=[]
    for i in files:
        _path=path+"/"+i
        if os.path.isdir(_path):
            _folder.append(i)
        elif os.path.isfile(_path):
            _size=os.path.getsize(_path)
            _files.append([i,_size,isImg(i)])
    return json.dumps({"folder":_folder,"file":_files})

def delete(path):
    if os.path.exists(path):
        if os.path.isfile(path):
            os.remove(path)
        elif os.path.isdir(path):
            shutil.rmtree(path)
        return True
    else:
        return False

def move(spath,dpath):
    # 源文件不存在
    if not os.path.exists(spath):
        return "spath_not_exist"
    # 目标文件夹不存在
    if not os.path.exists(dpath):
        return "dpath_not_exist"
    shutil.move(spath,dpath)
    return True

if __name__=="__main__":
    data=get_files('./files','')
    print(type(data))
    print(data)
