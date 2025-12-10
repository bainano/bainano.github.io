import http.client
import re

# 测试页面是否能正常访问
def test_page_access():
    print("测试页面访问...")
    try:
        conn = http.client.HTTPConnection("localhost", 8000)
        conn.request("GET", "/article.html")
        response = conn.getresponse()
        
        if response.status == 200:
            print("✓ 页面访问成功")
            html_content = response.read().decode("utf-8")
            conn.close()
            return html_content
        else:
            print(f"✗ 页面访问失败，状态码: {response.status}")
            conn.close()
            return None
    except Exception as e:
        print(f"✗ 页面访问出错: {e}")
        return None

# 测试页面结构是否正确
def test_page_structure(html_content):
    print("\n测试页面结构...")
    
    # 检查是否包含标准header组件
    if '<nav class="navbar">' in html_content:
        print("✓ 包含标准header组件")
    else:
        print("✗ 缺少标准header组件")
    
    # 检查是否包含文章内容区域
    if '<div class="article-content">' in html_content:
        print("✓ 包含文章内容区域")
    else:
        print("✗ 缺少文章内容区域")
    
    return html_content

# 测试Markdown渲染和目录生成
def test_markdown_rendering(html_content):
    print("\n测试Markdown渲染和目录生成...")
    
    # 检查是否生成了目录标题
    if '目录' in html_content:
        print("✓ 生成了目录")
    else:
        print("✗ 未生成目录")
    
    # 检查是否渲染了文章标题
    if '测试标题' in html_content:
        print("✓ 渲染了文章标题")
    else:
        print("✗ 未渲染文章标题")
    
    # 检查是否渲染了章节标题
    section1 = re.search(r'第二个带数字的标题', html_content)
    if section1:
        print("✓ 渲染了章节标题")
    else:
        print("✗ 未渲染章节标题")
    
    # 检查是否生成了锚点链接
    anchor_pattern = r'id="[^"]+"'  # 匹配id属性
    if re.search(anchor_pattern, html_content):
        print("✓ 为标题生成了锚点链接")
    else:
        print("✗ 未为标题生成锚点链接")

# 运行测试
def main():
    print("开始测试文章页面功能...\n")
    
    html_content = test_page_access()
    if not html_content:
        return
    
    test_page_structure(html_content)
    test_markdown_rendering(html_content)
    
    print("\n测试完成！")

if __name__ == "__main__":
    main()