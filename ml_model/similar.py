import pandas as pd
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

# 读取论文数据和特征向量
papers = pd.read_csv('./dataset/papers.csv.gz', compression='gzip')
feats = pd.read_csv('./dataset/feats.csv.gz', compression='gzip', header=None).values.astype(np.float32)

def euclidean_distance(v1, v2):
    return np.sqrt(np.sum((v1 - v2) ** 2))

# 自定义 KNN 查询
def knn(query_feat, feats, k=5):
    distances = []
    
    # 计算所有论文特征向量与查询特征向量的距离
    for feat in feats:
        distance = euclidean_distance(query_feat, feat)
        distances.append(distance)
    
    # 获取最小距离的前k个论文的索引
    top_k_indices = np.argsort(distances)[:k]
    
    # 获取这些论文的标题
    top_k_titles = papers.iloc[top_k_indices]['title']
    
    return top_k_titles

@app.route('/get_similar_papers', methods=['GET'])
def get_similar_papers():
    try:
        # 获取论文索引
        paper_index = int(request.args.get('index'))
        
        # 获取对应的特征向量
        query_feat = feats[paper_index]
        
        # 查询最相似的论文
        top_k_titles = knn(query_feat, feats, k=5)
        
        # 返回最相似的论文标题
        return jsonify({"similar_papers": top_k_titles.tolist()})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True,port=5001)