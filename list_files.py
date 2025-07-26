import os

def list_directory_contents(path='.', indent=''):
    try:
        # 列出目录内容
        items = os.listdir(path)
        
        for item in sorted(items):
            # 忽略隐藏文件
            if item.startswith('.'):
                continue
                
            full_path = os.path.join(path, item)
            if os.path.isdir(full_path):
                print(f"{indent}📁 {item}/")
                list_directory_contents(full_path, indent + '  ')
            else:
                print(f"{indent}📄 {item}")
    except Exception as e:
        print(f"无法读取目录 {path}: {str(e)}")

print("项目结构:")
list_directory_contents() 