from flask import Flask
from flask import render_template,request,make_response,send_from_directory
import os,json
import file_unit
import logging

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

conf={
    'port':8000,
    'path':'./files'
}

app=Flask(__name__)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory('./static/images','favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/',methods=['GET'])
def Index():
    if request.method=='GET':
        return render_template('index.html')

@app.route('/getfiles',methods=['GET'])
def GetFiles():
    if request.method=='GET':
        path=request.args.get('path')
        try:
            data=file_unit.get_files(conf['path'],path)
        except FileNotFoundError:
            return "error"
        return data

@app.route('/getfiles/img',methods=['GET'])
def GetImg():
    if request.method=='GET':
        path=request.args.get('path')
        with open(conf['path']+path,'rb') as f:
            return f.read()

@app.route('/transfer',methods=['GET','POST'])
def Transfer():
    if request.method=='GET': #下载文件
        path=conf['path']+request.args.get('path')
        name=request.args.get('name')
        response=make_response(send_from_directory(path,name,as_attachment=True))
        response.headers['Content-Disposition']="attachment;filename={}".format(name.encode().decode('latin-1'))
        return response
    elif request.method=='POST': #上传文件
        f=request.files.get('file')
        if f.filename=="":
            return "nofile"
        path=request.form.get('filepath')
        if path=='/':
            path=''
        path=conf['path']+path+'/'+f.filename
        if os.path.exists(path):
            return "existed"
        f.save(path)
        return "success"

@app.route('/newdir',methods=['POST'])
def NewDir():
    if request.method=='POST':
        path=request.form.get('path')
        name=request.form.get('name')
        if path=='/':
            path=conf['path']+path+name
        else:
            path=conf['path']+path+'/'+name
        if os.path.exists(path):
            return "exist"
        os.mkdir(path)
        return "success"

@app.route('/delete',methods=['POST'])
def DelSelected():
    if request.method=='POST':
        path=request.form.get('path')
        selected=json.loads(request.form.get('selected'))
        if 0==len(selected):
            return "noselected"
        if path=='/':
            path=''
        for i in selected:
            if True!=file_unit.delete(conf['path']+path+'/'+i):
                return path+'/'+i
        return "success"

@app.route('/move',methods=['POST'])
def MoveItems():
    if request.method=='POST':
        spath=request.form.get('spath')
        dpath=request.form.get('dpath')
        selected=json.loads(request.form.get('selected'))
        if 0==len(selected):
            return "noselected"
        if spath==dpath:
            return "samepath"
        if spath=='/':
            spath=''
        for i in selected:
            res=file_unit.move(conf['path']+spath+'/'+i,conf['path']+dpath)
            if True!=res:
                return json.dumps([res,i,dpath])
        return "success"

@app.route('/transfermsg',methods=['POST'])
def TransferMsg():
    if request.method=='POST':
        ip=request.remote_addr
        msg=request.form.get('msg')
        print('[{0}] {1}'.format(ip,msg))
        return "success"


if __name__ == "__main__":
    app.run(host='0.0.0.0',port=conf['port'])

