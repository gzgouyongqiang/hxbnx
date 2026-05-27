# -*- coding: utf-8 -*-
SCRIPT = r'C:\Users\Administrator\hxbnx_repo\unify_pages_v2.py'

with open(SCRIPT, 'r', encoding='utf-8') as f:
    content = f.read()

# 构造正确的Unicode字符串（从UTF-8字节解码）
s1 = bytes.fromhex('e29eaa20e58c96e5ada6e4b88de99abee5ada6').decode('utf-8')  # ➪ 化学不难学
s2 = bytes.fromhex('f09f939a20e585a8e983a8e4b893e9a298').decode('utf-8')      # 📚 全部专题
s3 = bytes.fromhex('f09f939d20e8af95e9a298e98089e8aeb2').decode('utf-8')      # 📝 试题选讲
s4 = bytes.fromhex('e58c96e5ada6e4b88de99abee5ada620c2b720e9ab98e4b889e7acace4b880e8bdaee5a48de4b9a020c2b720e4bba5e88083e5ae9ae69599').decode('utf-8')  # footer

# 替换4处字节转义
old1 = r'\xe2\x9e\xaa \xe5\x8c\x96\xe5\xad\xa6\xe4\xb8\x8d\xe9\x9a\xbe\xe5\xad\xa6'
old2 = r'\xf0\x9f\x93\x9a \xe5\x85\xa8\xe9\x83\xa8\xe4\xb8\x93\xe9\xa2\x98'
old3 = r'\xf0\x9f\x93\x9d \xe8\xaf\x95\xe9\xa2\x98\xe9\x80\x89\xe8\xae\xb2'
old4 = r'\xe5\x8c\x96\xe5\xad\xa6\xe4\xb8\x8d\xe9\x9a\xbe\xe5\xad\xa6 \xc2\xb7 \xe9\xab\x98\xe4\xb8\x89\xe7\xac\xac\xe4\xb8\x80\xe8\xbd\xae\xe5\xa4\x8d\xe4\xb9\xa0 \xc2\xb7 \xe4\xbb\xa5\xe8\x80\x83\xe5\xae\x9a\xe6\x95\x99'

content = content.replace(old1, s1)
content = content.replace(old2, s2)
content = content.replace(old3, s3)
content = content.replace(old4, s4)

with open(SCRIPT, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed 4 encoding issues in unify_pages_v2.py")
