import json
import socket

def get_init():
    try:
        with open('./config.json','r') as f:
            para=f.read()
        data=json.loads(para)
    except FileNotFoundError:
        data={
            'port':80,
            'path':'./files'
        }
    try:
        s=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        s.connect(('8.8.8.8',80))
        ip=s.getsockname()[0]
    finally:
        s.close()
    data['ip']=ip
    return data

def display_init_config(conf):
    print('-------------------------------')
    print('%10s'%'局域网IP:',conf['ip'])
    if conf['port']!=80:
        print('%11s'%'端口:',conf['port'])
    print('%6s'%'文件共享位置:',conf['path'])
    print('-------------------------------')
